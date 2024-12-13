---
title: 推荐系列-深入了解kafka系列-消费者
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 897
cover_picture: 'https://static.oschina.net/uploads/img/202007/20112131_VSiZ.jpg'
abbrlink: 234a4633
date: 2021-04-14 07:54:42
---

&emsp;&emsp;前言 与生产者对应的是消费者，应用程序可以通过KafkaConsumer来订阅主题，并从订阅的主题中拉取消息。不过在使用KafkaConsumer消费消息之前需要先了解消费者和消费组的概念，否则无法理解如...
<!-- more -->

                                                                                                                                                                                        ##### 前言 
 
<!--more--> 
##### Consumer 
 
 消费者（Consumer）负责订阅Kafka中的主题（Topic），并且从订阅的主题上拉取消息。与其他一些消息中间件不同的是：在Kafka的消费理念中还有一层消费组（Consumer Group）的概念，每个消费者都有一个对应的消费组。 
 
当消息发布到主题后，只会被投递给订阅它的每个消费组中的一个消费者。如图所示，某个主题中共有4个分区（Partition）：P0、P1、P2、P3。有两个消费组A和B都订阅了这个主题，消费组A中有4个消费者（C0、C1、C2和C3），消费组B中有2个消费者（C4和C5）。按照Kafka默认的规则，最后的分配结果是消费组A中的每一个消费者分配到1个分区，消费组B中的每一个消费者分配到2个分区，两个消费组之间互不影响。每个消费者只能消费所分配到的分区中的消息。换言之，每一个分区只能被一个消费组中的一个消费者所消费。 
 
##### 分区分配的演变（Rebalance） 
我们再来看一下消费组内的消费者个数变化时所对应的分区分配的演变。假设目前某消费组内只有一个消费者C0，订阅了一个主题，这个主题包含 7 个分区：P0、P1、P2、P3、P4、P5、P6。也就是说，这个消费者C0订阅了7个分区，具体分配情形如图。 
 
消费者与消费组此时消费组内又加入了一个新的消费者C1，按照既定的逻辑，需要将原来消费者C0的部分分区分配给消费者C1消费，如下图所示。消费者C0和C1各自负责消费所分配到的分区，彼此之间并无逻辑上的干扰。 
 
紧接着消费组内又加入了一个新的消费者C2，消费者C0、C1和C2按照下图方式各自负责消��所���配到的分区。 
 
消费者与消费组这种模型可以让整体的消费能力具备横向伸缩性，我们可以增加（或减少）消费者的个数来提高（或降低）整体的消费能力。对于分区数固定的情况，一味地增加消费者并不会让消费能力一直得到提升，如果消费者过多，出现了消费者的个数大于分区个数的情况，就会有消费者分配不到任何分区。参考图如下，一共有8个消费者，7个分区，那么最后的消费者C7由于分配不到任何分区而无法消费任何消息。 
 
##### 投递模式 
以上分配逻辑都是基于默认的分区分配策略进行分析的，可以通过消费者客户端参数partition.assignment.strategy 来设置消费者与订阅主题之间的分区分配策略，有关分区分配的更多细节可以再接下来的系列继续聊。 
对于消息中间件而言，一般有两种消息投递模式： 
点对点（P2P，Point-to-Point）模式: 点对点模式是基于队列的，消息生产者发送消息到队列，消息消费者从队列中接收消息。 
发布/订阅（Pub/Sub）模式: 发布订阅模式定义了如何向一个内容节点发布和订阅消息，这个内容节点称为主题（Topic），主题可以认为是消息传递的中介，消息发布者将消息发布到某个主题，而消息订阅者从主题中订阅消息。主题使得消息的订阅者和发布者互相保持独立，不需要进行接触即可保证消息的传递，发布/订阅模式在消息的一对多广播时采用。 
Kafka 同时支持两种消息投递模式，而这正是得益于消费者与消费组模型的契合： 
 
  如果所有的消费者都隶属于同一个消费组，那么所有的消息都会被均衡地投递给每一个消费者，即每条消息只会被一个消费者处理，这就相当于点对点模式的应用。  
  如果所有的消费者都隶属于不同的消费组，那么所有的消息都会被广播给所有的消费者，即每条消息会被所有的消费者处理，这就相当于发布/订阅模式的应用  
 
消费组是一个逻辑上的概念，它将旗下的消费者归为一类，每一个消费者只隶属于一个消费组。每一个消费组都会有一个固定的名称，消费者在进行消费前需要指定其所属消费组的名称，这个可以通过消费者客户端参数group.id来配置，默认值为空字符串。消费者并非逻辑上的概念，它是实际的应用实例，它可以是一个线程，也可以是一个进程。同一个消费组内的消费者既可以部署在同一台机器上，也可以部署在不同的机器上。 
##### 创建一个Kafka消费者 
 
 以下代码段显示了如何创建KafkaConsumer： 
 
 ```java 
  Properties props = new Properties();
props.put("bootstrap.servers", "broker1:9092,broker2:9092");
props.put("group.id", "CountryCounter");
props.put("key.deserializer",
    "org.apache.kafka.common.serialization.StringDeserializer");
props.put("value.deserializer",
    "org.apache.kafka.common.serialization.StringDeserializer");

KafkaConsumer<String, String> consumer =
    new KafkaConsumer<String, String>(props);

  ```  
 
 订阅主题 
 
 ```java 
  consumer.subscribe(Collections.singletonList("customerCountries"));

  ```  
 
 要订阅所有test主题，我们可以： 
 
 ```java 
  consumer.subscribe(Pattern.compile("test.*"));

  ```  
 
 轮询循环 
 
消费者API的核心是一个简单的循环，用于轮询服务器以获取更多数据。 一旦用户订阅了主题，轮询循环便会处理协调，分区重新平衡，心跳和数据获取的所有��细信息，从而为开发人员提供了一个干净的API，该API仅从分配的分区中返回可用数据。 消费者的主体如下所示 
 ```java 
  try {
    while (true) { 1
        ConsumerRecords<String, String> records = consumer.poll(100); 2
        for (ConsumerRecord<String, String> record : records) 3
        {
            log.debug("topic = %s, partition = %d, offset = %d,"
                customer = %s, country = %s\n",
                record.topic(), record.partition(), record.offset(),
                record.key(), record.value());

            int updatedCount = 1;
            if (custCountryMap.countainsKey(record.value())) {
                updatedCount = custCountryMap.get(record.value()) + 1;
            }
            custCountryMap.put(record.value(), updatedCount)

            JSONObject json = new JSONObject(custCountryMap);
            System.out.println(json.toString(4)) 4
        }
    }
} finally {
    consumer.close(); 5
}


  ```  
 
 反序列化 
 
 ```java 
  public class StringDeserializer implements Deserializer<String> {
  private String encoding = "UTF8";

  @Override
  public void configure(Map<String, ?> configs, boolean isKey) {
      String propertyName = isKey ? "key.deserializer.encoding" : "value.deserializer.encoding";
      Object encodingValue = configs.get(propertyName);
      if (encodingValue == null)
          encodingValue = configs.get("deserializer.encoding");
      if (encodingValue instanceof String)
          encoding = (String) encodingValue;
  }

  @Override
  public String deserialize(String topic, byte[] data) {
      try {
          if (data == null)
              return null;
          else
              return new String(data, encoding);
      } catch (UnsupportedEncodingException e) {
          throw new SerializationException("Error when deserializing byte[] to string due to unsupported encoding " + encoding);
      }
  }
}


  ```  
 
 消息消费 
 
Kafka中的消费是基于拉模式的。消息的消费一般有两种模式：推模式和拉模式。推模式是服务端主动将消息推送给消费者，而拉模式是消费者主动向服务端发起请求来拉取消息。从轮询循环代码清单中可以看出，Kafka中的消息消费是一个不断轮询的过程，消费者所要做的就是重复地调用poll（）方法，而poll（）方法返回的是所订阅的主题（分区）上的一组消息。对于poll（）方法而言，如果某些分区中没有可供消费的消息，那么此分区对应的消息拉取的结果就为空；如果订阅的所有分区中都没有可供消费的消息，那么poll（）方法返回为空的消息集合。 
 
poll（long）方法中timeout的时间单位固定为毫秒，而poll（Duration）方法可以根据Duration中的ofMillis（）、ofSeconds（）、ofMinutes（）、ofHours（）等多种不同的方法指定不同的时间单位，灵活性更强。并且 poll（long）方法也已经被标注为@Deprecated，虽然目前还可以使用，如果条件允许的话，还是推荐使用poll（Duration）的方式。 
我们在消费消息的时候可以直接对 ConsumerRecord 中感兴趣的字段进行具体的业务逻辑处理。 
poll（）方法的返回值类型是 ConsumerRecords，它用来表示一次拉取操作所获得的消息集，内部包含了若干ConsumerRecord，它提供了一个iterator（）方法来循环遍历消息集内部的消息，iterator（）方法的定义如下： 
 ```java 
      @Override
    public Iterator<ConsumerRecord<K, V>> iterator() {
        return new ConcatenatedIterable<>(records.values()).iterator();
    }


  ```  
在 ConsumerRecords 类中还提供了几个方法来方便开发人员对消息集进行处理：count（）方法用来计算出消息集中的���息��数，返回类型是int；isEmpty（）方法用来判断消息集是否为空，返回类型是boolean；empty（）方法用来获取一个空的消息集，返回类型是ConsumerRecord＜K，V＞。 
到目前为止，可以简单地认为poll（）方法只是拉取一下消息而已，但就其内部逻辑而言并不简单，它涉及消费位移、消费者协调器、组协调器、消费者的选举、分区分配的分发、再均衡的逻辑、心跳等内容 
 
 位移提交 
 
对于Kafka中的分区而言，它的每条消息都有唯一的offset，用来表示消息在分区中对应的位置。对于消费者而言，它也有一个offset的概念，消费者使用offset来表示消费到分区中某个消息所在的位置。单词“offset”可以翻译为“偏移量”，也可以翻译为“位移”，很多同学可能并没有过多地在意这一点：在很多中文资料中都会交叉使用“偏移量”和“位移”这两个词，并没有很严谨地进行区分。 
我对offset做了一些区分：对于消息在分区中的位置，我们将offset称为“偏移量”；对于消费者消费到的位置，将 offset 称为“位移”，有时候也会更明确地称之为“消费位移”。做这一区分的目的是让读者在遇到 offset 的时候可以很容易甄别出是在讲分区存储层面的内容，还是在讲消费层面的内容 
在每次调用poll（）方法时，它返回的是还没有被消费过的消息集（当然这个前提是消息已经存储在Kafka 中了，并且暂不考虑异常情况的发生），在旧消费者客户端中，消费位移是存储在ZooKeeper中的。而在新消费者客户端中，消费位移存储在Kafka内部的主题__consumer_offsets中。这里把将消费位移存储起来（持久化）的动作称为“提交”，消费者在消费完消息之后需要执行消费位移的提交。 
 
 
 指定位移消费 
 
正是有了消费位移的持久化，才使消费者在关闭、崩溃或者在遇到再均衡的时候，可以让接替的消费者能够根据存储的消费位移继续进行消费 ,可是有一个问题则是 _consumer_offsets 位移信息过期而被删除后，它也没有可以查找的消费位移 ，这个时候就会根据消费者客户端参数auto.offset.reset的配置来决定从何处开始进行消费 
除了查找不到消费位移，位移越界也会触发 auto.offset.reset 参数的执行 ，然而有些时候，我们需要一种更细粒度的掌控，可以让我们从特定的位移处开始拉取消息，哎 ！这个时候 KafkaConsumer 中的 seek（）方法正好提供了这个功能，让我们得以追前消费或回溯消费。seek（）方法的具体定义如下： 
 ```java 
  public void seek(TopicPartition partition, long offset) {}

  ```  
seek（）方法为我们提供了从特定位置读取消息的能力，我们可以通过这个方法来向前跳过若干消息，也可以通过这个方法来向后回溯若干消息，这样为消息的消费提供了很大的灵活性 

                                        