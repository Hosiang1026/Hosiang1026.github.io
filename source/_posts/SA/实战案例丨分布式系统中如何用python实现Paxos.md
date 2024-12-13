---
title: 推荐系列-实战案例丨分布式系统中如何用python实现Paxos
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1979
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: f9c6bb47
date: 2021-04-15 09:46:45
---

&emsp;&emsp;摘要：提到分布式算法，就不得不提 Paxos 算法，在过去几十年里，它基本上是分布式共识的代 名词，因为当前最常用的一批共识算法都是基于它改进的。比如，Fast Paxos 算法、 Cheap Paxos 算法...
<!-- more -->

                                                                                                                                                                                         
本文分享自华为云社区《实战分布式系统-python实现Paxos》，原文作者：Leo Xiao 。 
 
#### 一致性算法背景：Paxos 
 
 一致性算法解决的问题：分布式系统中数据不能存在单个节点（主机）上，否则可能出现单点故障；多个节点（主机）需要保证具有相同的数据。 
 什么是一致性：一致性就是数据保持一致，在分布式系统中，可以理解为多个节点中数据的值是一致的。 
 一致性模型分类：一般分为强一致性和弱一致性，强一致性保证系统改变提交以后立即改变集群的状态。常见模型包括：Paxos，Raft（muti-paxos），ZAB（muti-paxos）； 弱一致性也叫最终一致性，系统不保证改变提交以后立即改变集群的状态，但是随着时间的推移最终状态一致的。常见模型包括：DNS系统，Gossip协议 
 一致性算法使用案例： Google的Chubby分布式锁服务，采用了Paxos算法；etcd分布式键值数据库，采用了Raft算法；ZooKeeper分布式应用协调服务以及Chubby的开源实现，采用ZAB算法 
 
 
 simple-paxos就单个静态值达一致性本身并不实用，我们需要实现的集群系统（银行账户服务）希望就随时间变化的特定状态（账户余额）达成一致。所以需要使用Paxos就每个操作达成一致，将每个修改视为状态机转换。 
 Multi-Paxos实际上是simple Paxos实例（插槽）的序列，每个实例都按顺序编号。每个状态转换都被赋予一个“插槽编号”，集群的每个成员都以严格的数字顺序执行转换。为了更改群集的状态（例如，处理传输操作），我们尝试在下一个插槽中就该操作达成一致性。具体来说，这意味着向每个消息添加一个插槽编号，并在每个插槽的基础上跟踪所有协议状态。 
 为每个插槽运行Paxos，至少两次往返会太慢。Multi-Paxos通过对所有插槽使用相同的选票编号集进行优化，并同时对所有插槽执行Prepare/Promise。 
 
 
  
 ```java 
  Client   Proposer      Acceptor     Learner
   |         |          |  |  |       |  | --- First Request ---
   X-------->|          |  |  |       |  |  Request
   |         X--------->|->|->|       |  |  Prepare(N)
   |         |<---------X--X--X       |  |  Promise(N,I,{Va,Vb,Vc})
   |         X--------->|->|->|       |  |  Accept!(N,I,V)
   |         |<---------X--X--X------>|->|  Accepted(N,I,V)
   |<---------------------------------X--X  Response
   |         |          |  |  |       |  |
  ``` 
  
 
 
#### Paxos实现 
在实用软件中实现Multi-Paxos是出了名的困难，催生了许多论文如"Paxos Made Simple"，“Paxos Made Practical” 
 
 首先，multi-poposer在繁忙的环境中可能会成为问题，因为每个群集成员都试图在每个插槽中决定其状态机操作。解决方法是选举一名“leader”，负责为每个时段提交选票。所有其他群集节点将新操作发送到领导者执行。因此，在只有一名领导人的正常运作中，不会发生投票冲突。 
 
Prepare/Promise阶段可以作为一种leader选举：无论哪个集群成员拥有最近承诺的选票号码，都被视为leader。leader后续可以自由地直接执行Accept/Accepted阶段，而不重复第一阶段。我们将在下文看到的，leader选举实际上是相当复杂的。 
虽然simple Paxos保证集群不会达成冲突的决定，但它不能保证会做出任何决定。例如，如果初始的Prepare消息丢失，并且没有到达接受者，则提议者将等待永远不会到达的Promise消息。解决这个问题需要精心设计的重新传输：足以最终取得进展，但不会群集产生数据包风暴。 
 
 另一个问题是决定的传播。在正常情况下，简单地广播Decision信息就可以解决这个问题。但是，如果消息丢失，节点可能会永远不知道该决定，并且无法为以后的插槽应用状态机转换。所以实现需要一些机制来共享有关已决定提案的信息。 
 
使用分布式状态机带来了另一个挑战：当新节点启动时，它需要获取群集的现有状态。 虽然可以通过赶上第一个插槽以来的所有插槽的决策来做到这一点，但在一个大的集群中，这可能涉及数百万个插槽。此外，我们需要一些方法来初始化一个新的群集。 
 
#### 集群库介绍 
前面都是理论介绍，下面我们使用python来实现一个简化的Multi-Paxos 
 
##### 业务场景和痛点 
我们以简单的银行账户管理服务的场景作为案例。在这个服务中，每一个账户都有一个当前余额，同时每个账户都有自己的账号。用户可以对账户进行“存款”、“转账”、“查询当前余额”等操作。“转账”操作同时涉及了两个账户：转出账户和转入账户，如果账户余额不足，转账操作必须被驳回。 
 
 如果这个服务仅仅在一个服务器上部署，很容易就能够实现：使用一个操作锁来确保“转账”操作不会同时进行，同时对转出账户的进行校验。然而，银行不可能仅仅依赖于一个服务器来储存账户余额这样的关键信息，通常，这些服务都是被分布在多个服务器上的，每一个服务器各自运行着相同代码的实例。用户可以通过任何一个服务器来操作账户。 
 在一个简单的分布式处理系统的实现中，每个服务器都会保存一份账户余额的副本。它会处理任何收到的操作，并且将账户余额的更新发送给其他的服务器。但是这种方法有一个严重的问题：如果两个服务器同时对一个账户进行操作，哪一个新的账户余额是正确的？即使服务器不共享余额而是共享操作，对一个账户同时进行转账操作也可能造成透支。 
 从根本上来说，这些错误的发生都是由于服务器使用它们本地状态来响应操作，而不是首先确保本地状态与其他服务器相匹配。比如，想象服务器A接到了从账号101向账号202转账的操作指令，而此时服务器B已经处理了另一个把账号101的钱都转到账号202的请求，却没有通知服务器A。这样，服务器A的本地状态与服务器B不一样，即使会造成账户101透支，服务器A依然允许从账号101进行转账操作。 
 
 
##### 分布式状态机 
为了防止上述情况发生我们采用了一种叫做“分布式状态机”的工具。它的思路是对每个同样的输入，每个服务器都运行同样的对应的状态机。由于���态机的特性，对于同样的输入每个服务器的输出都是一样的。对于像“转账”、“查询当前余额”等操作，账号和余额也都是状态机的输入。 
这个应用的状态机比较简单： 
 
  
 ```java 
   def execute_operation(state, operation):
     if operation.name == 'deposit':
         if not verify_signature(operation.deposit_signature):
         return state, False
         state.accounts[operation.destination_account] += operation.amount
         return state, True
     elif operation.name == 'transfer':
         if state.accounts[operation.source_account] < operation.amount:
             return state, False
             state.accounts[operation.source_account] -= operation.amount
         state.accounts[operation.destination_account] += operation.amount
         return state, True
     elif operation.name == 'get-balance':
     return state, state.accounts[operation.account]
  ``` 
  
 
值得注意的是，运行“查询当前余额”操作时虽然并不会改变当前状态，但是我们依然把它当做一个状态变化操作来实现。这确保了返回的余额是分布式系统中的最新信息，并且不是基于一个服务器上的本地状态来进行返回的。 
这可能跟你在计算机课程中学习到的典型的状态机不太一样。传统的状态机是一系列有限个状态的集合，每个状态都与一个标记的转移行为相对应，而在本文中，状态机的状态是账户余额的集合，因此存在无穷多个可能的状态。但是，状态机的基本规则同样适用于本文的状态机：对于同样的初始状态，同样的输入总是有同样的输出。 
因此，分布式状态机确保了对于同样的操作，每个主机都会有同样的相应。但是，为了确保每个服务器都允许状态机的输入，前文中提到的问题依然存在。这是一个一致性问题，为了解决它我们采用了一种派生的Paxos算法。 
 
##### 核心需求 
 
 可以为较大的应用程序提供一致性服务: 我们用一个Cluster库来实现简化的Multi-Paxos 
 正确性是这个库最重要的能力，因此结构化代码是很重要的，以便我们可以看到并测试它与规范的对应关系。 
 复杂的协议可能会出现复杂的故障，因此我们将构建对复现和调试不常见的故障的支持。 
 我们会实现POC代码：足以证明核心概念是实用的，代码的结构化是为了后续添加此功能对核心实现的更改最小 我们开始coding吧。 
 
 
##### 类型和常量 
cluster中的协议需要使用15不同的消息类型，每种消息类型使用collection中的namedturple定义： 
 
  
 ```java 
      Accepted = namedtuple('Accepted', ['slot', 'ballot_num'])
    Accept = namedtuple('Accept', ['slot', 'ballot_num', 'proposal'])
    Decision = namedtuple('Decision', ['slot', 'proposal'])
    Invoked = namedtuple('Invoked', ['client_id', 'output'])
    Invoke = namedtuple('Invoke', ['caller', 'client_id', 'input_value'])
    Join = namedtuple('Join', [])
    Active = namedtuple('Active', [])
    Prepare = namedtuple('Prepare', ['ballot_num'])
    Promise = namedtuple('Promise', ['ballot_num', 'accepted_proposals'])
    Propose = namedtuple('Propose', ['slot', 'proposal'])
    Welcome = namedtuple('Welcome', ['state', 'slot', 'decisions'])
    Decided = namedtuple('Decided', ['slot'])
    Preempted = namedtuple('Preempted', ['slot', 'preempted_by'])
    Adopted = namedtuple('Adopted', ['ballot_num', 'accepted_proposals'])
    Accepting = namedtuple('Accepting', ['leader'])
  ``` 
  
 
使用命名元组描述每种消息类型可以保持代码的clean，并有助于避免一些简单的错误。如果命名元组构造函数没有被赋予正确的属性，则它将引发异常，从而使错误变得明显。元组在日志消息中k可以很好地格式化，不会像字典那样使用那么多的内存。 创建消息： 
 
  
 ```java 
      msg = Accepted(slot=10, ballot_num=30)
  ``` 
  
 
访问消息： 
 
  
 ```java 
      got_ballot_num = msg.ballot_num
  ``` 
  
 
后面我们会了解这些消息的含义。 代码还引入了一些常量，其中大多数常量定义了各种消息的超时： 
 
  
 ```java 
      JOIN_RETRANSMIT = 0.7
    CATCHUP_INTERVAL = 0.6
    ACCEPT_RETRANSMIT = 1.0
    PREPARE_RETRANSMIT = 1.0
    INVOKE_RETRANSMIT = 0.5
    LEADER_TIMEOUT = 1.0
    NULL_BALLOT = Ballot(-1, -1)  # sorts before all real ballots
    NOOP_PROPOSAL = Proposal(None, None, None)  # no-op to fill otherwise empty slots
  ``` 
  
 
最后我们需要定义协议中的Proposal和Ballot 
 
  
 ```java 
      Proposal = namedtuple('Proposal', ['caller', 'client_id', 'input'])
    Ballot = namedtuple('Ballot', ['n', 'leader'])
  ``` 
  
 
 
##### 组件模型 
实现multi-paxos的核心组件包括Role和Node。 
 
 为了保证可测试性并保持代码的可读性，我们将Cluster分解为与协议中描述的角色相对应的几个类。每个都是Role的子类。 
 
 
  
 ```java 
  class Role(object):

    def __init__(self, node):
        self.node = node
        self.node.register(self)
        self.running = True
        self.logger = node.logger.getChild(type(self).__name__)

    def set_timer(self, seconds, callback):
        return self.node.network.set_timer(self.node.address, seconds,
                                           lambda: self.running and callback())

    def stop(self):
        self.running = False
        self.node.unregister(self)
  ``` 
  
 
群集节点的角色由Node类粘在一起，该类代表网络上的单个节点。在程序过程中角色将添加到节点中，并从节点中删除。 
到达节点的消息将中继到所有活动角色，调用以消息类型命名的方法，前缀为do_。 这些do_方法接收消息的属性作为关键字参数，以便于访问。Node``类还提供了``send方法作为方便，使用functools.partial为Network类的相同方法提供一些参数。 
 
  
 ```java 
  class Node(object):
    unique_ids = itertools.count()

    def __init__(self, network, address):
        self.network = network
        self.address = address or 'N%d' % self.unique_ids.next()
        self.logger = SimTimeLogger(
            logging.getLogger(self.address), {'network': self.network})
        self.logger.info('starting')
        self.roles = []
        self.send = functools.partial(self.network.send, self)

    def register(self, roles):
        self.roles.append(roles)

    def unregister(self, roles):
        self.roles.remove(roles)

    def receive(self, sender, message):
        handler_name = 'do_%s' % type(message).__name__

        for comp in self.roles[:]:
            if not hasattr(comp, handler_name):
                continue
            comp.logger.debug("received %s from %s", message, sender)
            fn = getattr(comp, handler_name)
            fn(sender=sender, **message._asdict())
  ``` 
  
 
 
##### 应用接口 
每个集群成员上都会创建并启动一个Member对象，提供特定于应用程序的状态机和对等项列表。如果成员对象正在加入现有集群，则该成员对象向该节点添加bootstrap角色，如果正在创建新集群，则该成员对象添加seed。再用Network.run在单独的线程中运行协议。 
应用程序通过该invoke方法与集群进行交互，从而启动了状态转换， 确定该提议并运行状态机后，invoke将返回状态机的输出。该方法使用简单的同步Queue来等待协议线程的结果。 
 
  
 ```java 
  class Member(object):

    def __init__(self, state_machine, network, peers, seed=None,
                 seed_cls=Seed, bootstrap_cls=Bootstrap):
        self.network = network
        self.node = network.new_node()
        if seed is not None:
            self.startup_role = seed_cls(self.node, initial_state=seed, peers=peers,
                                      execute_fn=state_machine)
        else:
            self.startup_role = bootstrap_cls(self.node,
                                      execute_fn=state_machine, peers=peers)
        self.requester = None

    def start(self):
        self.startup_role.start()
        self.thread = threading.Thread(target=self.network.run)
        self.thread.start()

    def invoke(self, input_value, request_cls=Requester):
        assert self.requester is None
        q = Queue.Queue()
        self.requester = request_cls(self.node, input_value, q.put)
        self.requester.start()
        output = q.get()
        self.requester = None
        return output
  ``` 
  
 
 
##### Role 类 
Paxos协议中的角色包括：client, acceptor, proposer, learner, and leader。在典型的实现中，单个processor可以同时扮演一个或多个角色。这不会影响协议的正确性，通常会合并角色以改善协议中的延迟和/或消息数量。 
下面逐一实现每个角色类 
 
##### Acceptor 
Acceptor 类实现的是Paxos中的 acceptor角色，所以必须存储最近promise的选票编号，以及每个时段接受的各个slot的proposal，同时需要相应Prepare和Accept消息。 这里的POC实现是一个和协议可以直接对应的短类，对于acceptor来说Multi-paxos看起来像是简单的Paxos，只是在message中添加了slot number。 
 
  
 ```java 
  class Acceptor(Role):

    def __init__(self, node):
        super(Acceptor, self).__init__(node)
        self.ballot_num = NULL_BALLOT
        self.accepted_proposals = {}  # {slot: (ballot_num, proposal)}

    def do_Prepare(self, sender, ballot_num):
        if ballot_num > self.ballot_num:
            self.ballot_num = ballot_num
            # we've heard from a scout, so it might be the next leader
            self.node.send([self.node.address], Accepting(leader=sender))

        self.node.send([sender], Promise(
            ballot_num=self.ballot_num, 
            accepted_proposals=self.accepted_proposals
        ))

    def do_Accept(self, sender, ballot_num, slot, proposal):
        if ballot_num >= self.ballot_num:
            self.ballot_num = ballot_num
            acc = self.accepted_proposals
            if slot not in acc or acc[slot][0] < ballot_num:
                acc[slot] = (ballot_num, proposal)

        self.node.send([sender], Accepted(
            slot=slot, ballot_num=self.ballot_num))
  ``` 
  
 
 
##### Replica 
Replica类是Role类最复杂的子类，对应协议中的Learner和Proposal角色，它的主要职责是：提出新的proposal；在决定proposal时调用本地状态机；跟踪当前Leader；以及将新启动的节点添加到集群中。 
Replica创建新的proposal以响应来自客户端的“invoke”消息，选择它认为是未使用的插槽，并向当前leader发送“Propose”消息。如果选定插槽的共识是针对不同proposal，则replica必须使用新插槽re-propose。 
下图显示Replica的角色控制流程： 
 
  
 ```java 
  Requester    Local Rep   Current Leader
   X---------->|             |    Invoke
   |           X------------>|    Propose
   |           |<------------X    Decision
   |<----------X             |    Decision
   |           |             |  
  ``` 
  
 
Decision消息表示集群已达成共识的插槽， Replica类存储新的决定并运行状态机，直到到达未确定的插槽。Replica从本地状态机已处理的提交的slot识别出集群已同意的已决定的slot。如果slot出现乱序，提交的提案可能会滞后，等待下一个空位被决定。提交slot后，每个replica会将操作结果发送回一条Invoked消息给请求者。 
在某些情况下slot可能没有有效的提案，也没有决策,需要状态机一个接一个地执行slot，因此群集必须就填充slot的内容达成共识。为了避免这种可能性，Replica在遇到插槽时会提出“no-op”的proposal。如果最终决定了这样的proposal，则状态机对该slot不执行任何操作。 
同样，同一proposal有可能被Decision两次。对于任何此类重复的proposal，Replica将跳过调用状态机，而不会对该slot执行任何状态转换。 
Replicas需要知道哪个节点是active leader才能向其发送Propose消息， 要实现这一目标，每个副本都使用三个信息源跟踪active leader。 
当leader 的角色转换为active时，它会向同一节点上的副本发送一条Adopted消息（下图）： 
 
  
 ```java 
  Leader    Local Repplica   
   X----------->|          Admopted
  ``` 
  
 
当acceptor角色向Promise新的leader发送Accepting消息时，它将消息发送到其本地副本（下图）。 
 
  
 ```java 
  Acceptor    Local Repplica   
   X----------->|          Accepting
  ``` 
  
 
active leader将以心跳的形式发送Active消息。如果在LEADER_TIMEOUT到期之前没有此类消息到达，则Replica将假定该Leader已死，并转向下一个Leader。在这种情况下，重要的是所有副本都选择相同的新领导者，我们可以通过对成员进行排序并在列表中选择下一个leader。 
当节点加入网络时，Bootstrap将发送一条Join消息（下图）。Replica以一条Welcome包含其最新状态的消息作为响应，从而使新节点能够快速启用。 
 
  
 ```java 
  BootStrap     Replica        Replica       Replica
     X---------->|             |             |    Join
     |<----------X             X             |    Welcome
     X------------------------>|             |    Join
     |<------------------------X             |    Welcome
     X-------------------------------------->|    Join
     |<--------------------------------------X    Welcome      
class Replica(Role):

    def __init__(self, node, execute_fn, state, slot, decisions, peers):
        super(Replica, self).__init__(node)
        self.execute_fn = execute_fn
        self.state = state
        self.slot = slot
        self.decisions = decisions
        self.peers = peers
        self.proposals = {}
        # next slot num for a proposal (may lead slot)
        self.next_slot = slot
        self.latest_leader = None
        self.latest_leader_timeout = None

    # making proposals

    def do_Invoke(self, sender, caller, client_id, input_value):
        proposal = Proposal(caller, client_id, input_value)
        slot = next((s for s, p in self.proposals.iteritems() if p == proposal), None)
        # propose, or re-propose if this proposal already has a slot
        self.propose(proposal, slot)

    def propose(self, proposal, slot=None):
        """Send (or resend, if slot is specified) a proposal to the leader"""
        if not slot:
            slot, self.next_slot = self.next_slot, self.next_slot + 1
        self.proposals[slot] = proposal
        # find a leader we think is working - either the latest we know of, or
        # ourselves (which may trigger a scout to make us the leader)
        leader = self.latest_leader or self.node.address
        self.logger.info(
            "proposing %s at slot %d to leader %s" % (proposal, slot, leader))
        self.node.send([leader], Propose(slot=slot, proposal=proposal))

    # handling decided proposals

    def do_Decision(self, sender, slot, proposal):
        assert not self.decisions.get(self.slot, None), \
                "next slot to commit is already decided"
        if slot in self.decisions:
            assert self.decisions[slot] == proposal, \
                "slot %d already decided with %r!" % (slot, self.decisions[slot])
            return
        self.decisions[slot] = proposal
        self.next_slot = max(self.next_slot, slot + 1)

        # re-propose our proposal in a new slot if it lost its slot and wasn't a no-op
        our_proposal = self.proposals.get(slot)
        if (our_proposal is not None and 
            our_proposal != proposal and our_proposal.caller):
            self.propose(our_proposal)

        # execute any pending, decided proposals
        while True:
            commit_proposal = self.decisions.get(self.slot)
            if not commit_proposal:
                break  # not decided yet
            commit_slot, self.slot = self.slot, self.slot + 1

            self.commit(commit_slot, commit_proposal)

    def commit(self, slot, proposal):
        """Actually commit a proposal that is decided and in sequence"""
        decided_proposals = [p for s, p in self.decisions.iteritems() if s < slot]
        if proposal in decided_proposals:
            self.logger.info(
                "not committing duplicate proposal %r, slot %d", proposal, slot)
            return  # duplicate

        self.logger.info("committing %r at slot %d" % (proposal, slot))
        if proposal.caller is not None:
            # perform a client operation
            self.state, output = self.execute_fn(self.state, proposal.input)
            self.node.send([proposal.caller], 
                Invoked(client_id=proposal.client_id, output=output))

    # tracking the leader

    def do_Adopted(self, sender, ballot_num, accepted_proposals):
        self.latest_leader = self.node.address
        self.leader_alive()

    def do_Accepting(self, sender, leader):
        self.latest_leader = leader
        self.leader_alive()

    def do_Active(self, sender):
        if sender != self.latest_leader:
            return
        self.leader_alive()

    def leader_alive(self):
        if self.latest_leader_timeout:
            self.latest_leader_timeout.cancel()

        def reset_leader():
            idx = self.peers.index(self.latest_leader)
            self.latest_leader = self.peers[(idx + 1) % len(self.peers)]
            self.logger.debug("leader timed out; tring the next one, %s", 
                self.latest_leader)
        self.latest_leader_timeout = self.set_timer(LEADER_TIMEOUT, reset_leader)

    # adding new cluster members

    def do_Join(self, sender):
        if sender in self.peers:
            self.node.send([sender], Welcome(
                state=self.state, slot=self.slot, decisions=self.decisions))
  ``` 
  
 
 
#### Leader Scout Commander 
Leader的主要任务是接受Propose要求新投票的消息并做出决定。成功完成协议的Prepare/Promise部分后Leader将处于“Active状态” 。活跃的Leader可以立即发送Accept消息以响应Propose。 
与按角色分类的模型保持一致，Leader会委派scout和Commander角色来执行协议的每个部分。 
 
  
 ```java 
  class Leader(Role):

    def __init__(self, node, peers, commander_cls=Commander, scout_cls=Scout):
        super(Leader, self).__init__(node)
        self.ballot_num = Ballot(0, node.address)
        self.active = False
        self.proposals = {}
        self.commander_cls = commander_cls
        self.scout_cls = scout_cls
        self.scouting = False
        self.peers = peers

    def start(self):
        # reminder others we're active before LEADER_TIMEOUT expires
        def active():
            if self.active:
                self.node.send(self.peers, Active())
            self.set_timer(LEADER_TIMEOUT / 2.0, active)
        active()

    def spawn_scout(self):
        assert not self.scouting
        self.scouting = True
        self.scout_cls(self.node, self.ballot_num, self.peers).start()

    def do_Adopted(self, sender, ballot_num, accepted_proposals):
        self.scouting = False
        self.proposals.update(accepted_proposals)
        # note that we don't re-spawn commanders here; if there are undecided
        # proposals, the replicas will re-propose
        self.logger.info("leader becoming active")
        self.active = True

    def spawn_commander(self, ballot_num, slot):
        proposal = self.proposals[slot]
        self.commander_cls(self.node, ballot_num, slot, proposal, self.peers).start()

    def do_Preempted(self, sender, slot, preempted_by):
        if not slot:  # from the scout
            self.scouting = False
        self.logger.info("leader preempted by %s", preempted_by.leader)
        self.active = False
        self.ballot_num = Ballot((preempted_by or self.ballot_num).n + 1, 
                                 self.ballot_num.leader)

    def do_Propose(self, sender, slot, proposal):
        if slot not in self.proposals:
            if self.active:
                self.proposals[slot] = proposal
                self.logger.info("spawning commander for slot %d" % (slot,))
                self.spawn_commander(self.ballot_num, slot)
            else:
                if not self.scouting:
                    self.logger.info("got PROPOSE when not active - scouting")
                    self.spawn_scout()
                else:
                    self.logger.info("got PROPOSE while scouting; ignored")
        else:
            self.logger.info("got PROPOSE for a slot already being proposed")
  ``` 
  
 
Leader想要变为活动状态时会创建一个Scout角色，以响应Propose在其处于非活动状态时收到消息（下图），Scout发送（并在必要时重新发送）Prepare消息，并收集Promise响应，直到听到消息为止。多数同行或直到被抢占为止。在通过Adopted或Preempted回复给Leader。 
 
  
 ```java 
  Leader    Scout      Acceptor     Acceptor    Acceptor
   |          |          |            |           |   
   |          X--------->|            |           |    Prepare
   |          |<---------X            |           |    Promise
   |          X---------------------->|           |    Prepare
   |          |<----------------------X           |    Promise
   |          X---------------------------------->|    Prepare
   |          |<----------------------------------X    Promise
   |<---------X          |            |           |    Adopted
class Scout(Role):
  ``` 
  
 
  
 
  
 ```java 
      def __init__(self, node, ballot_num, peers):
        super(Scout, self).__init__(node)
        self.ballot_num = ballot_num
        self.accepted_proposals = {}
        self.acceptors = set([])
        self.peers = peers
        self.quorum = len(peers) / 2 + 1
        self.retransmit_timer = None

    def start(self):
        self.logger.info("scout starting")
        self.send_prepare()

    def send_prepare(self):
        self.node.send(self.peers, Prepare(ballot_num=self.ballot_num))
        self.retransmit_timer = self.set_timer(PREPARE_RETRANSMIT, self.send_prepare)

    def update_accepted(self, accepted_proposals):
        acc = self.accepted_proposals
        for slot, (ballot_num, proposal) in accepted_proposals.iteritems():
            if slot not in acc or acc[slot][0] < ballot_num:
                acc[slot] = (ballot_num, proposal)

    def do_Promise(self, sender, ballot_num, accepted_proposals):
        if ballot_num == self.ballot_num:
            self.logger.info("got matching promise; need %d" % self.quorum)
            self.update_accepted(accepted_proposals)
            self.acceptors.add(sender)
            if len(self.acceptors) >= self.quorum:
                # strip the ballot numbers from self.accepted_proposals, now that it
                # represents a majority
                accepted_proposals = \ 
                    dict((s, p) for s, (b, p) in self.accepted_proposals.iteritems())
                # We're adopted; note that this does *not* mean that no other
                # leader is active.  # Any such conflicts will be handled by the
                # commanders.
                self.node.send([self.node.address],
                    Adopted(ballot_num=ballot_num, 
                            accepted_proposals=accepted_proposals))
                self.stop()
        else:
            # this acceptor has promised another leader a higher ballot number,
            # so we've lost
            self.node.send([self.node.address], 
                Preempted(slot=None, preempted_by=ballot_num))
            self.stop()
  ``` 
  
 
Leader为每个有active proposal的slot创建一个Commander角色（下图）。像Scout一样，Commander发送和重新发送Accept消息，并等待大多数接受者的回复Accepted或抢占消息。接受建议后，Commander将Decision消息广播到所有节点。它用Decided或Preempted响应Leader。 
 
  
 ```java 
  Leader    Commander   Acceptor     Acceptor    Acceptor
   |          |          |            |           |   
   |          X--------->|            |           |    Accept
   |          |<---------X            |           |    Accepted
   |          X---------------------->|           |    Accept
   |          |<----------------------X           |    Accepted
   |          X---------------------------------->|    Accept
   |          |<----------------------------------X    Accepted
   |<---------X          |            |           |    Decided
class Commander(Role):
  ``` 
  
 
  
 
  
 ```java 
      def __init__(self, node, ballot_num, slot, proposal, peers):
        super(Commander, self).__init__(node)
        self.ballot_num = ballot_num
        self.slot = slot
        self.proposal = proposal
        self.acceptors = set([])
        self.peers = peers
        self.quorum = len(peers) / 2 + 1

    def start(self):
        self.node.send(set(self.peers) - self.acceptors, Accept(
            slot=self.slot, ballot_num=self.ballot_num, proposal=self.proposal))
        self.set_timer(ACCEPT_RETRANSMIT, self.start)

    def finished(self, ballot_num, preempted):
        if preempted:
            self.node.send([self.node.address], 
                           Preempted(slot=self.slot, preempted_by=ballot_num))
        else:
            self.node.send([self.node.address], 
                           Decided(slot=self.slot))
        self.stop()

    def do_Accepted(self, sender, slot, ballot_num):
        if slot != self.slot:
            return
        if ballot_num == self.ballot_num:
            self.acceptors.add(sender)
            if len(self.acceptors) < self.quorum:
                return
            self.node.send(self.peers, Decision(
                           slot=self.slot, proposal=self.proposal))
            self.finished(ballot_num, False)
        else:
            self.finished(ballot_num, True)
  ``` 
  
 
有一个问题是后续会介绍的网络模拟器甚至在节点内的消息上也引入了数据包丢失。当所有 Decision消息丢失时，该协议无法继续进行。Replica继续重新传输Propose消息，但是Leader忽略了这些消息，因为它已经对该slot提出了proposal，由于没有Replica��到Decision所以Replica的catch过程找不到结果，解决方案是像实际网络堆栈以西洋确保本地消息始终传递成功。 
 
#### Bootstrap 
node加入cluster时必须获取当前的cluster状态， Bootstrap role循环每个节点发送join消息，知道收到Welcome, Bootstrap的时序图如下所示： 
如果在每个role（replica，leader，acceptor）中实现启动过程，并等待welcome消息，会把初始化逻辑分散到每个role，测试起来会非常麻烦，最终，我们决定添加bootstrap role，一旦启动完成，就给node添加每个role，并且将初始状态传递给他们的构造函数。 
 
  
 ```java 
  class Bootstrap(Role):

    def __init__(self, node, peers, execute_fn,
                 replica_cls=Replica, acceptor_cls=Acceptor, leader_cls=Leader,
                 commander_cls=Commander, scout_cls=Scout):
        super(Bootstrap, self).__init__(node)
        self.execute_fn = execute_fn
        self.peers = peers
        self.peers_cycle = itertools.cycle(peers)
        self.replica_cls = replica_cls
        self.acceptor_cls = acceptor_cls
        self.leader_cls = leader_cls
        self.commander_cls = commander_cls
        self.scout_cls = scout_cls

    def start(self):
        self.join()

    def join(self):
        self.node.send([next(self.peers_cycle)], Join())
        self.set_timer(JOIN_RETRANSMIT, self.join)

    def do_Welcome(self, sender, state, slot, decisions):
        self.acceptor_cls(self.node)
        self.replica_cls(self.node, execute_fn=self.execute_fn, peers=self.peers,
                         state=state, slot=slot, decisions=decisions)
        self.leader_cls(self.node, peers=self.peers, commander_cls=self.commander_cls,
                        scout_cls=self.scout_cls).start()
        self.stop()
  ``` 
  
 
 
#### 参考： 
 
 http://aosabook.org/en/500L/clustering-by-consensus.html 
 https://lamport.azurewebsites.net/pubs/lamport-paxos.pdf 
 https://lamport.azurewebsites.net/pubs/paxos-simple.pdf 
 https://www.scs.stanford.edu/~dm/home/papers/paxos.pdf 
 https://www.researchgate.net/publication/221234235_Revisiting_the_Paxos_Algorithm 
 https://www.paxos.com/ 
 https://www.cs.cornell.edu/courses/cs6410/2017fa/slides/20-p2p-gossip.pdf 
 https://en.wikipedia.org/wiki/Paxos_(computer_science) 
 https://ongardie.net/static/raft/userstudy/quizzes.html 
 https://zhuanlan.zhihu.com/p/130332285 
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        