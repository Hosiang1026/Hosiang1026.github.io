---
title: 推荐系列-轻松上手使用gs_dump和gs_dumpall命令导出数据
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 254
cover_picture: 'https://api.ixiaowai.cn/gqapi/gqapi.php'
abbrlink: b34be646
date: 2022-03-27 11:55:56
---

&emsp;&emsp; 导出单个数据库 导出所有数据库 无权限角色导出数据 一、概述 openGauss提供的gs_dump和gs_dumpall工具，能够帮助用户导出需要的数据库对象或其相关信息。通过导入工具将导出的数据信息...
<!-- more -->
                                                                                               
  概述  
  导出单个数据库  
  导出所有数据库  
  无权限角色导出数据  
 
 
#### 一、概述 
openGauss提供的gs_dump和gs_dumpall工具，能够帮助用户导出需要的数据库对象或其相关信息。通过导入工具将导出的数据信息导入至需要的数据库，可以完成数据库信息的迁移。gs_dump支持导出单个数据库或其内的对象，而gs_dumpall支持导出openGauss中所有数据库或各库的公共全局对象。详细的使用场景见表1。 
表 1 适用场景 
 
  
   
    适用场景  
    支持的导出粒度  
    支持的导出格式  
    配套的导入方法  
   
  
  
   
    导出单个数据库  
    数据库级导出。 
     
     导出全量信息。 使用导出的全量信息可以创建一个与当前库相同的数据库，且库中数据也与当前库相同。  
     仅导出库中所有对象的定义，包含库定义、函数定义、模式定义、表定义、索引定义和存储过程定义等。 使用导出的对象定义，可以快速创建一个相同的数据库，但是库中并无原数据库的数据。  
     仅导出数据。 
      
    
     
     纯文本格式 
     自定义归档格式 
     目录归档格式 
     tar归档格式 
      
    
     
     纯文本格式数据文件导入请参见使用gsql元命令导入数据。 
     自定义归档格式、目录归档格式和tar归档格式数据文件导入请参见使用gs_restore命令导入数据。 
      
   
   
    模式级导出。 
     
     导出模式的全量信息。 
     仅导出模式中数据。 
     仅导出对象的定义，包含表定义、存储过程定义和索引定义等。 
      
   
   
    
     
     表级导出。 
      
      导出表的全量信息。 
      仅导出表中数据。 
      仅导出表的定义。 
      
      
   
   
    导出所有数据库  
    数据库级导出。 
     
     导出全量信息。 使用导出的全量信息可以创建与当前主机相同的一个主机环境，拥有相同数据库和公共全局对象，且库中数据也与当前各库相同。  
     仅导出各数据库中的对象定义，包含表空间、库定义、函数定义、模式定义、表定义、索引定义和存储过程定义等。 使用导出的对象定义，可以快速创建与当前主机相同的一个主机环境，拥有相同的数据库和表空间，但是库中并无原数据库的数据。  
     仅导出数据。 
      
    纯文本格式  
    数据文件导入请参见使用gsql元命令导入数据。  
   
   
    
     
     各库公共全局对象导出。 
      
      仅导出表空间信息。 
      仅导出角色信息。 
      导出角色与表空间。 
      
      
   
  
 
gs_dump和gs_dumpall通过-U指定执行导出的用户帐户。如果当前使用的帐户不具备导出所要求的权限时，会无法导出数据。此时，可在导出命令中设置–role参数来指定具备权限的角色。在执行命令后，gs_dump和gs_dumpall会使用–role参数指定的角色，完成导出动作。可使用该功能的场景请参见表1，详细操作请参见无权限角色导出数据。 
gs_dump和gs_dumpall通过对导出的数据文件加密，导入时��加密的数据文件进行解密，可以防止数据信息泄露，为数据库的安全提供保证。注意，使用gs_dump加密的纯文本格式文件，如果导出的数据库中包含存储过程，不支持使用gsql命令恢复文件，请使用另外三种模式导出数据库，并使用gs_restore恢复。 
gs_dump和gs_dumpall工具在进行数据导出时，其他用户可以访问数据库（读或写）。 
gs_dump和gs_dumpall工具支持导出完整一致的数据。例如，T1时刻启动gs_dump导出A数据库，或者启动gs_dumpall导出openGauss数据库，那么导出数据结果将会是T1时刻A数据库或者该openGauss数据库的数据状态，T1时刻之后对A数据库或openGauss数据库的修改不会被导出。 
 
##### 注意事项 
 
 禁止修改导出的文件和内容，否则可能无法恢复成功。 
  如果数据库中包含的对象数量（数据表、视图、索引）在50万以上，为了提高性能且避免出现内存问题，建议通过gs_guc工具设置数据库节点的如下参数（如果参数值大于如下建议值，则无需设置）。  
 ```java 
  gs_guc set -N all -I all -c 'max_prepared_transactions = 1000'
gs_guc set -N all -I all -c 'max_locks_per_transaction = 512'

  ``` 
   
  为了保证数据一致性和完整性，导出工具会对需要转储的表设置共享锁。如果表在别的事务中设置了共享锁，gs_dump和gs_dumpall会等待锁释放后锁定表。如果无法在指定时间内锁定某个表，转储会失败。用户可以通过指定–lock-wait-timeout选项，自定义等待锁超时时间。  
  由于gs_dumpall读取所有数据库中的表，因此必须以openGauss管理员身份进行连接，才能导出完整文件。在使用gsql执行脚本文件导入时，同样需要管理员权限，以便添加用户和组，以及创建数据库。  
 
  
 
#### 二、导出单个数据库 
 
  导出数据库  
  导出模式  
  导出表  
 
 
#### ① 导出数据库 
openGauss支持使用gs_dump工具导出某个数据库级的内容，包含数据库的数据和所有对象定义。可根据需要自定义导出如下信息： 
 
  导出数据库全量信息，包含数据和所有对象定义。 使用导出的全量信息可以创建一个与当前库相同的数据库，且库中数据也与当前库相同。  
  仅导出所有对象定义，包括：库定义、函数定义、模式定义、表定义、索引定义和存储过程定义等。 使用导出的对象定义，可以快速创建一个相同的数据库，但是库中并无原数据库的数据。  
  仅导出数据，不包含所有对象定义。  
 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dump导出userdatabase数据库。 复制代码 
 ```java 
  gs_dump -U jack -f /home/omm/backup/userdatabase_backup.tar -p 8000 postgres -F t 
Password:

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名。 说明： 不指定连接数据库的用户名时，默认以安装时创建的初始系统管理员连接。  
      -U jack  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码验证，即无需输入-W选项； 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/postgres_backup.tar  
     
     
      -p  
      指定服务器所侦听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
     
      dbname  
      需要导出的数据库名称  
      postgres  
     
     
      -F  
      选择导出文件格式。-F参数值如下： 
       
       p：纯文本格式 
       c：自定义归档 
       d：目录归档格式 
       t：tar归档格式 
        
      -F t  
     
    
     其他参数说明请参见《工具参考》中“服务端工具 > gs_dump”章节。  
 
 
##### 示例 
示例一：执行gs_dump，导出postgres数据库全量信息，导出文件格式为sql文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/postgres_backup.sql -p 8000 postgres -F p
Password:
gs_dump[port='8000'][postgres][2017-07-21 15:36:13]: dump database postgres successfully
gs_dump[port='8000'][postgres][2017-07-21 15:36:13]: total time: 3793  ms

  ``` 
  
示例二：执行gs_dump，仅导出postgres数据库中的数据，不包含数据库对象定义，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/postgres_data_backup.dmp -p 8000 postgres -a -F c
Password:
gs_dump[port='8000'][postgres][2017-07-21 15:36:13]: dump database postgres successfully
gs_dump[port='8000'][postgres][2017-07-21 15:36:13]: total time: 3793  ms

  ``` 
  
示例三：执行gs_dump，仅导出postgres数据库所有对象的定义，导出文件格式为sql文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/postgres_def_backup.sql -p 8000 postgres -s -F p
Password:
gs_dump[port='8000'][postgres][2017-07-20 15:04:14]: dump database postgres successfully
gs_dump[port='8000'][postgres][2017-07-20 15:04:14]: total time: 472 ms

  ``` 
  
示例四：执行gs_dump，仅导出postgres数据库的所有对象的定义，导出文件格式为文本格式，并对导出文件进行加密。 
 
 ```java 
  gs_dump -f /home/omm/backup/postgres_def_backup.sql -p 8000 postgres --with-encryption AES128 --with-key 1234567812345678 -s -F p
Password:
gs_dump[port='8000'][postgres][2018-11-14 11:25:18]: dump database postgres successfully
gs_dump[port='8000'][postgres][2018-11-14 11:25:18]: total time: 1161  ms
  ``` 
  
 
#### ② 导出模式 
openGauss目前支持使用gs_dump工具导出模式级的内容，包含模式的数据和定义。用户可通过灵活的自定义方式导出模式内容，不仅支持选定一个模式或多个模式的导出，还支持排除一个模式或者多个模式的导出。可根据需要自定义导出如下信息： 
 
 导出模式全量信息，包含数据和对象定义。 
 仅导出数据，即模式包含表中的数据，不包含对象定义。 
 仅导出模式对象定义，包括：表定义、存储过程定义和索引定义等。 
 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dump同时导出hr和public模式。  
 ```java 
  gs_dump -U jack -f /home/omm/backup/MPPDB_schema_backup -p 8000 human_resource -n hr -n public -F d 
Password:

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名。  
      -U jack  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码验证，即无需输入-W选项。 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/MPPDB_schema_backup  
     
     
      -p  
      指定服务器所侦听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
     
      dbname  
      需要导出的数据库名称  
      human_resource  
     
     
      -n  
      只导出与模式名称匹配的模式，此选项包括模式本身和所有它包含的对象。 
       
       单个模式：-n schemaname 
       多个模式：多次输入-n schemaname 
        
      
       
       单个模式：-n hr 
       多个模式：-n hr -n public 
        
     
     
      -F  
      选择导出文件格式。-F参数值如下： 
       
       p：纯文本格式 
       c：自定义归档 
       d：目录归档格式 
       t：tar归档格式 
        
      -F d  
     
    
     其他参数说明请参见《工具参考》中“服务端工具 > gs_dump”章节。  
 
 
##### 示例 
示例一：执行gs_dump，导出hr模式全量信息，导出文件格式为文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_backup.sql -p 8000 human_resource -n hr -F p
Password:
gs_dump[port='8000'][human_resource][2017-07-21 16:05:55]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:05:55]: total time: 2425  ms

  ``` 
  
示例二：执行gs_dump，仅导出hr模式的数据，导出文件格式为tar归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_data_backup.tar -p 8000 human_resource -n hr -a -F t
Password:
gs_dump[port='8000'][human_resource][2018-11-14 15:07:16]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-11-14 15:07:16]: total time: 1865  ms

  ``` 
  
示例三：执行gs_dump，仅导出hr模式的定义，导出文件格式为目录归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_def_backup -p 8000 human_resource -n hr -s -F d
Password:
gs_dump[port='8000'][human_resource][2018-11-14 15:11:34]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-11-14 15:11:34]: total time: 1652  ms

  ``` 
  
示例四：执行gs_dump，导出human_resource数据库时，排除hr模式，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_backup.dmp -p 8000 human_resource -N hr -F c
Password:
gs_dump[port='8000'][human_resource][2017-07-21 16:06:31]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:06:31]: total time: 2522  ms

  ``` 
  
示例五：执行gs_dump，同时导出hr和public模式，且仅导出模式定义，导出文件格式为tar归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_backup1.tar -p 8000 human_resource -n hr -n public -s -F t
gs_dump[port='8000'][human_resource][2017-07-21 16:07:16]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:07:16]: total time: 2132  ms

  ``` 
  
示例六：执行gs_dump，导出human_resource数据库时，排除hr和public模式，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_schema_backup2.dmp -p 8000 human_resource -N hr -N public -F c
Password:
gs_dump[port='8000'][human_resource][2017-07-21 16:07:55]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:07:55]: total time: 2296  ms

  ``` 
  
示例七：执行gs_dump，导出public模式下所有表（视图、序列和外表）和hr模式中staffs表，包含数据和表定义，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_backup3.dmp -p 8000 human_resource -t public.* -t hr.staffs -F c
Password:
gs_dump[port='8000'][human_resource][2018-12-13 09:40:24]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-12-13 09:40:24]: total time: 896  ms
  ``` 
  
 
### ③ 导出表 
openGauss支持使用gs_dump工具导出表级的内容，包含表定义和表数据。视图、序列和外表属于特殊的表。用户可通过灵活的自定义方式导出表内容，不仅支持选定一个表或多个表的导出，还支持排除一个表或者多个表的导出。可根据需要自定义导出如下信息： 
 
 导出表全量信息，包含表数据和表定义。 
 仅导出数据，不包含表定义。 
 仅导出表定义。 
 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dump同时导出指定表hr.staffs和hr.employments。  
 ```java 
  gs_dump -U jack -f /home/omm/backup/MPPDB_table_backup -p 8000 human_resource -t hr.staffs -t hr.employments -F d
Password:

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名。  
      -U jack  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码验证，即无需输入-W选项。 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/MPPDB_table_backup  
     
     
      -p  
      指定服务器所侦听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
     
      dbname  
      需要导出的数据库名称。  
      human_resource  
     
     
      -t  
      指定导出的表（或视图、序列、外表），可以使用多个-t选项来选择多个表，也可以使用通配符指定多个表对象。当使用通配符指定多个表对象时，注意给pattern打引号，防止shell扩展通配符。 
       
       单个表：-t schema.table 
       多个表：多次输入-t schema.table 
        
      
       
       单个表：-t hr.staffs 
       多个表：-t hr.staffs -t hr.employments 
        
     
     
      -F  
      选择导出文件格式。-F参数值如下： 
       
       p：纯文本格式 
       c：自定义归档 
       d：目录归档格式 
       t：tar归档格式 
        
      -F d  
     
     
      -T  
      不转储的表（或视图、或序列、或外表）对象列表，可以使用多个-t选项来选择多个表，也可以使用通配符制定多个表对象。 当同时输入-t和-T时，会转储在-t列表中，而不在-T列表中的表对象。  
      -T table1  
     
    
      
 
其他参数说明请参见《工具参考》中“服务端工具 > gs_dump”章节。 
 
##### 示例 
示例一：执行gs_dump，导出表hr.staffs的定义和数据，导出文件格式为文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup.sql -p 8000 human_resource -t hr.staffs  -F p
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:05:10]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:05:10]: total time: 3116  ms

  ``` 
  
示例二：执行gs_dump，只导出表hr.staffs的数据，导出文件格式为tar归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_data_backup.tar -p 8000 human_resource -t hr.staffs -a -F t 
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:04:26]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:04:26]: total time: 2570  ms

  ``` 
  
示例三：执行gs_dump，导出表hr.staffs的定义，导出文件格式为目录归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_def_backup -p 8000 human_resource -t hr.staffs -s -F d 
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:03:09]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:03:09]: total time: 2297  ms 

  ``` 
  
示例四：执行gs_dump，不导出表hr.staffs，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup4.dmp -p 8000 human_resource -T hr.staffs -F c
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:14:11]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:14:11]: total time: 2450  ms

  ``` 
  
示例五：执行gs_dump，同时导出两个表hr.staffs和hr.employments，导出文件格式为文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup1.sql -p 8000 human_resource -t hr.staffs -t hr.employments -F p
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:19:42]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:19:42]: total time: 2414  ms

  ``` 
  
示例六：执行gs_dump，导出时，排除两个表hr.staffs和hr.employments，导出文件格式为文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup2.sql -p 8000 human_resource -T hr.staffs -T hr.employments -F p
Password:
gs_dump[port='8000'][human_resource][2017-07-21 17:21:02]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 17:21:02]: total time: 3165  ms

  ``` 
  
示例七：执行gs_dump，导出表hr.staffs的定义和数据，只导出表hr.employments的定义，导出文件格式为tar归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup3.tar -p 8000 human_resource -t hr.staffs -t hr.employments --exclude-table-data hr.employments -F t
Password:
gs_dump[port='8000'][human_resource][2018-11-14 11:32:02]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-11-14 11:32:02]: total time: 1645  ms

  ``` 
  
示例八：执行gs_dump，导出表hr.staffs的定义和数据，并对导出文件进行加密，导出文件格式为文本格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup4.sql -p 8000 human_resource -t hr.staffs --with-encryption AES128 --with-key abcdefg_?1234567 -F p
Password:
gs_dump[port='8000'][human_resource][2018-11-14 11:35:30]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-11-14 11:35:30]: total time: 6708  ms

  ``` 
  
示例九：执行gs_dump，导出public模式下所有表（包括视图、序列和外表）和hr模式中staffs表，包含数据和表定义，导出文件格式为自定义归档格式。 
 
 ```java 
  gs_dump -f /home/omm/backup/MPPDB_table_backup5.dmp -p 8000 human_resource -t public.* -t hr.staffs -F c
Password:
gs_dump[port='8000'][human_resource][2018-12-13 09:40:24]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2018-12-13 09:40:24]: total time: 896  ms

  ``` 
  
示例十： 执行gs_dump，仅导出依赖于t1模式下的test1表对象的视图信息，导出文件格式为目录归档格式。 
 
 ```java 
  gs_dump -U jack -f /home/omm/backup/MPPDB_view_backup6 -p 8000 human_resource -t t1.test1 --include-depend-objs --exclude-self -F d
Password:
gs_dump[port='8000'][jack][2018-11-14 17:21:18]: dump database human_resource successfully
gs_dump[port='8000'][jack][2018-11-14 17:21:23]: total time: 4239  ms

  ``` 
  
 
 ```java 
  


  ``` 
  
 
#### 三、导出所有数据库  
 
###   
 
  导出所有数据库  
  导出全局对象  
 
 
#### ① 导出所有数据库 
openGauss支持使用gs_dumpall工具导出所有数据库的全量信息，包含openGauss中每个数据库信息和公共的全局对象信息。可根据需要自定义导出如下信息： 
 
  导出所有数据库全量信息，包含openGauss中每个数据库信息和公共的全局对象信息（包含角色和表空间信息）。 使用导出的全量信息可以创建与当前主机相同的一个主机环境，拥有相同数据库和公共全局对象，且库中数据也与当前各库相同。  
  仅导出数据，即导出每个数据库中的数据，且不包含所有对象定义和公共的全局对象信息。  
  仅导出所有对象定义，包括：表空间、库定义、函数定义、模式定义、表定义、索引定义和存储过程定义等。 使用导出的对象定义，可以快速创建与当前主机相同的一个主机环境，拥有相同的数据库和表空间，但是库中并无原数据库的数据。  
 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dumpall一次导出所有数据库信息。  
 ```java 
  gs_dumpall  -U omm -f /home/omm/backup/MPPDB_backup.sql -p 8000 
Password：

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名，需要是openGauss管理员用户。  
      -U omm  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码��证，即无需输入-W选项； 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/MPPDB_backup.sql  
     
     
      -p  
      指定服务器所监听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
    
     其他参数说明请参见《工具参考》中“服务端工具 > gs_dumpall”章节。  
 
 
##### 示例 
示例一：执行gs_dumpall，导出所有数据库全量信息（omm用户为管理员用户），导出文件为文本格式。执行命令后，会有很长的打印信息，最终出现total time即代表执行成功。示例中将不体现中间的打印信息。 
 
 ```java 
  gs_dumpall -U omm -f /home/omm/backup/MPPDB_backup.sql -p 8000 
Password:
gs_dumpall[port='8000'][2017-07-21 15:57:31]: dumpall operation successful
gs_dumpall[port='8000'][2017-07-21 15:57:31]: total time: 9627  ms

  ``` 
  
示例二：执行gs_dumpall，仅导出所有数据库定义（omm用户为管理员用户），导出文件为文本格式。执行命令后，会有很长的打印信息，最终出现total time即代表执行成功。示例中将不体现中间的打印信息。 
 
 ```java 
  gs_dumpall  -U omm -f /home/omm/backup/MPPDB_backup.sql -p 8000 -s 
Password:
gs_dumpall[port='8000'][2018-11-14 11:28:14]: dumpall operation successful
gs_dumpall[port='8000'][2018-11-14 11:28:14]: total time: 4147  ms

  ``` 
  
示例三：执行gs_dumpall，仅导出所有数据库中数据，并对导出文件进行加密，导出文件为文本格式。执行命令后，会有很长的打印信息，最终出现total time即代表执行成功。示例中将不体现中间的打印信息。 
 
 ```java 
  gs_dumpall -f /home/omm/backup/MPPDB_backup.sql -p 8000 -a --with-encryption AES128 --with-key abcdefg_?1234567
gs_dumpall[port='8000'][2018-11-14 11:32:26]: dumpall operation successful
gs_dumpall[port='8000'][2018-11-14 11:23:26]: total time: 4147  ms
  ``` 
  
  
 
#### ②导出全局对象 
openGauss支持使用gs_dumpall工具导出所有数据库公共的全局对象，包含数据库用户和组，表空间及属性（例如：适用于数据库整体的访问权限）信息。 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dumpall导出表空间对象信息。  
 ```java 
  gs_dumpall -U omm -f /home/omm/backup/MPPDB_tablespace.sql -p 8000 -t
Password:

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名，需要是openGauss管理员用户。  
      -U omm  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码验证，即无需输入-W选项； 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/MPPDB_tablespace.sql  
     
     
      -p  
      指定服务器所侦听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
     
      -t  
      或者–tablespaces-only，只转储表空间，不转储数据库或角色。  
      -  
     
    
     其他参数说明请参见《工具参考》中“服务端工具 > gs_dumpall”章节。  
 
 
##### 示例 
示例一：执行gs_dumpall，导出所有数据库的公共全局表空间信息和用户信息（omm用户为管理员用户），导出文件为文本格式。 
 
 ```java 
  gs_dumpall -U omm -f /home/omm/backup/MPPDB_globals.sql -p 8000 -g
Password:
gs_dumpall[port='8000'][2018-11-14 19:06:24]: dumpall operation successful
gs_dumpall[port='8000'][2018-11-14 19:06:24]: total time: 1150  ms

  ``` 
  
示例二： 执行gs_dumpall，导出所有数据库的公共全局表空间信息（omm用户为管理员用户），并对导出文件进行加密，导出文件为文本格式。 
 
 ```java 
  gs_dumpall -U omm -f /home/omm/backup/MPPDB_tablespace.sql -p 8000 -t --with-encryption AES128 --with-key abcdefg_?1234567
Password:
gs_dumpall[port='8000'][2018-11-14 19:00:58]: dumpall operation successful
gs_dumpall[port='8000'][2018-11-14 19:00:58]: total time: 186  ms

  ``` 
  
示例三：执行gs_dumpall，导出所有数据库的公共全局用户信息（omm用户为管理员用户），导出文件为文本格式。 
 
 ```java 
  gs_dumpall -U omm -f /home/omm/backup/MPPDB_user.sql -p 8000 -r
Password:
gs_dumpall[port='8000'][2018-11-14 19:03:18]: dumpall operation successful
gs_dumpall[port='8000'][2018-11-14 19:03:18]: total time: 162  ms
  ``` 
  
  
 
#### 四、无权限角色导出数据 
gs_dump和gs_dumpall通过-U指定执行导出的用户帐户。如果当前使用的帐户不具备导出所要求的权限时，会无法导出数据。此时，需要将有权限的用户赋权给无权限用户，然后可在导出命令中设置–role参数来指定具备权限的角色。在执行命令后，gs_dump和gs_dumpall会使用–role参数指定的角色，完成导出动作。 
 
##### 操作步骤 
 
 以操作系统用户omm登录数据库主节点。 
  使用gs_dump导出human_resource数据库数据。 用户jack不具备导出数据库human_resource的权限，而角色role1具备该权限，要实现导出数据库human_resource，需要将role1赋权给jack，然后可以在导出命令中设置–role角色为role1，使用role1的权限，完成导出目的。导出文件格式为tar归档格式。  
 ```java 
  gs_dump -U jack -f /home/omm/backup/MPPDB_backup.tar -p 8000 human_resource --role role1 --rolepassword  abc@1234 -F t
Password:

  ``` 
  表 1 常用参数说明   
   
    
     
      参数  
      参数说明  
      举例  
     
    
    
     
      -U  
      连接数据库的用户名。  
      -U jack  
     
     
      -W  
      指定用户连接的密码。 
       
       如果主机的认证策略是trust，则不会对数据库管理员进行密码验证，即无需输入-W选项。 
       如果没有-W选项，并且不是数据库管理员，会提示用户输入密码。 
        
      -W abcd@123  
     
     
      -f  
      将导出文件发送至指定目录文件夹。如果这里省略，则使用标准输出。  
      -f /home/omm/backup/MPPDB_backup.tar  
     
     
      -p  
      指定服务器所侦听的TCP端口或本地Unix域套接字后缀，以确保连接。  
      -p 8000  
     
     
      dbname  
      需要导出的数据库名称  
      human_resource  
     
     
      –role  
      指定导出使用的角色名。选择该选项，会使导出工具连接数据库后，发起一个SET ROLE角色名命令。当所授权用户（由-U指定）没有导出工具要求的权限时，该选项会起到作用，即切换到具备相应权限的角色。  
      -r role1  
     
     
      –rolepassword  
      指定具体角色用户的角色密码。  
      –rolepassword abc@1234  
     
     
      -F  
      选择导出文件格式。-F参数值如下： 
       
       p：纯文本格式 
       c：自定义归档 
       d：目录归档格式 
       t：tar归档格式 
        
      -F t  
     
    
     其他参数说明请参见《工具参考》中“服务端工具 > gs_dump”章节或“服务端工具 > gs_dumpall”章节。  
 
 
##### 示例 
示例一：执行gs_dump导出数据，用户jack不具备导出数据库human_resource的权限，而角色role1具备该权限，要实现导出数据库human_resource，可以在导出命令中设置–role角色为role1，使用role1的权限，完成导出目的。导出文件格式为tar归档格式。 
 
 ```java 
  human_resource=# CREATE USER jack IDENTIFIED BY "1234@abc";
CREATE ROLE
human_resource=# GRANT role1 TO jack;
GRANT ROLE

gs_dump -U jack -f /home/omm/backup/MPPDB_backup11.tar -p 8000 human_resource --role role1 --rolepassword abc@1234 -F t
Password:
gs_dump[port='8000'][human_resource][2017-07-21 16:21:10]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:21:10]: total time: 4239  ms

  ``` 
  
示例二：执行gs_dump导出数据，用户jack不具备导出模式public的权限，而角色role1具备该权限，要实现导出模式public，可以在导出命令中设置–role角色为role1，使用role1的权限，完成导出目的。导出文件格式为tar归档格式。 
 
 ```java 
  human_resource=# CREATE USER jack IDENTIFIED BY "1234@abc";
CREATE ROLE
human_resource=# GRANT role1 TO jack;
GRANT ROLE

gs_dump -U jack -f /home/omm/backup/MPPDB_backup12.tar -p 8000 human_resource -n public --role role1 --rolepassword abc@1234 -F t
Password:
gs_dump[port='8000'][human_resource][2017-07-21 16:21:10]: dump database human_resource successfully
gs_dump[port='8000'][human_resource][2017-07-21 16:21:10]: total time: 3278  ms

  ``` 
  
示例三：执行gs_dumpall导出数据，用户jack不具备导出所有数据库的权限，而角色role1（管理员）具备该权限，要实现导出所有数据库，可以在导出命令中设置–role角色为role1，使用role1的权限，完成导出目的。导出文件格式为文本归档格式。 
 
 ```java 
  human_resource=# CREATE USER jack IDENTIFIED BY "1234@abc";
CREATE ROLE
human_resource=# GRANT role1 TO jack;
GRANT ROLE

gs_dumpall -U jack -f /home/omm/backup/MPPDB_backup.sql -p 8000 --role role1 --rolepassword abc@1234
Password:
gs_dumpall[port='8000'][human_resource][2018-11-14 17:26:18]: dumpall operation successful
gs_dumpall[port='8000'][human_resource][2018-11-14 17:26:18]: total time: 6437  ms
  ``` 
  
本节分享就到这里啦，感谢小伙伴的阅读。 
                                        