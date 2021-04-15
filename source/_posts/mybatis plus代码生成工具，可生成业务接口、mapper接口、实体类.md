---
title: 推荐系列-mybatis plus代码生成工具，可生成业务接口、mapper接口、实体类
categories: 热门文章
tags:
  - Popular
author: csdn
top: 1
date: 2021-04-15 08:14:57
cover_picture: 'https://profile.csdnimg.cn/2/A/B/3_weixin_40986713'
---

&emsp;&emsp;前言：原本想使用AutoGenerator 是 MyBatis-Plus 的官方代码生成器，尝试了一下，竟然报错，原因可能是MyBatis-Plus和mybatis-plus-generator 的版本不一致，因为我用的MyBatis-Plus 的版本是3.42 ，但是mybatis-plus-generator的3.4.2不知道怎么了，下载不下来，只能下载3.4.1，发现运行起来老是报错，还有一堆配置说明要看，于是自己手写生成代码的工具类，觉得更简单些。分享给大家，请多多指教。pom文件引入ja.
<!-- more -->

        
                
                    前言： 
原本想使用AutoGenerator 是 MyBatis-Plus 的官方代码生成器 ，尝试了一下，竟然报错，原因可能是MyBatis-Plus和mybatis-plus-generator 的版本不一致，因为我用的MyBatis-Plus 的版本是3.42 ，但是mybatis-plus-generator的3.4.2不知道怎么了，下载不下来，只能下载3.4.1，发现运行起来老是报错，还有一堆配置说明要看，于是自己手写生成代码的工具类，觉得更简单些。分享给大家，请多多指教。 
pom文件引入java-mysql 驱动依赖  
 
 ```java 
          <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.22</version>
        </dependency>
  ``` 
  
  
单类代码实现，复制粘贴到编辑器里，主方法运行即可。  
 
 ```java 
  
import org.apache.commons.lang3.StringUtils;

import java.io.File;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * mybatis plus通用生成工具
 * 可生成业务接口、mapper接口、实体类
 *
 * @author tarzan Liu
 * @date 2021/4/10 19:44
 */

public class MyBatisPlusTools {
    private static final String driver = "com.mysql.cj.jdbc.Driver";//驱动
    private static final String user = "root";  //数据库账号
    private static final String pwd = "123456"; //数据库密码
    private static final String url = "jdbc:mysql://127.0.0.1:3306/ofcms" + "?user=" + user + "&password=" + pwd+"&useUnicode=true&characterEncoding=UTF-8&zeroDateTimeBehavior=convertToNull"; //链接参数
    private static String tableName = "of_cms_ad"; // 数据库表名
    private static String aliasName = "cms_ad"; // 数据库别名,可以与数据库表名相同
    private static final String packagePath = "com/tarzan/cms"; //mapper.xml命名空间路径
    private static final String packageName = "com.tarzan.cms"; //mapper.xml命名空间路径
    private static final String author = "tarzan"; // 作者
    private static final String rootPathName = "src/main/java/"; // 默认生成主文件夹路径
    private static Connection getConnection = null;
    static SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    /**
     * 链接数据库
     */
    private static Connection getConnections() {
        try {
            Class.forName(driver);
            getConnection = DriverManager.getConnection(url);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return getConnection;
    }

    /**
     * 格式化默认值
     */
    private static String defaultValue(String value) {
        if (StringUtils.isNotBlank(value)) {
            return "；默认值：" + value;
        }
        {
            return "";
        }
    }

    private  static String getAliasName(String tableName,String prefix){
        return tableName.substring(prefix.length());
    }

    /**
     * 格式化数据类型
     * 返回的是基本类型的包装类
     * 如果使用基本数据类型long
     */
    private static String formatType(String typeValue) {

        if ("bit".equalsIgnoreCase(typeValue)) {
            return "Boolean";
        }
        else if (
                typeValue.equalsIgnoreCase("int") || typeValue.equalsIgnoreCase("int unsigned")
                        || typeValue.equalsIgnoreCase("tinyint") || typeValue.equalsIgnoreCase("tinyint unsigned")
                        || typeValue.equalsIgnoreCase("smallint") || typeValue.equalsIgnoreCase("smallint unsigned")
                        || typeValue.equalsIgnoreCase("mediumint") || typeValue.equalsIgnoreCase("mediumint unsigned")
                ) {
            return "Integer";
        } else if (typeValue.equalsIgnoreCase("bigint") || typeValue.equalsIgnoreCase("bigint unsigned")) {
            return "Long";
        } else if (typeValue.equalsIgnoreCase("float") || typeValue.equalsIgnoreCase("float unsigned")) {
            return "Float";
        } else if (typeValue.equalsIgnoreCase("decimal") || typeValue.equalsIgnoreCase("decimal unsigned") || typeValue.equalsIgnoreCase("numeric") || typeValue.equalsIgnoreCase("numeric unsigned")
                || typeValue.equalsIgnoreCase("real") || typeValue.equalsIgnoreCase("real unsigned") || typeValue.equalsIgnoreCase("money") || typeValue.equalsIgnoreCase("money unsigned")
                || typeValue.equalsIgnoreCase("smallmoney") || typeValue.equalsIgnoreCase("smallmoney unsigned")) {
            return "Double";
        } else if (typeValue.equalsIgnoreCase("varchar") || typeValue.equalsIgnoreCase("char")
                || typeValue.equalsIgnoreCase("nvarchar") || typeValue.equalsIgnoreCase("nchar")
                || typeValue.equalsIgnoreCase("text")) {
            return "String";
        } else if (typeValue.equalsIgnoreCase("datetime")) {
            return "Date";
        } else if (typeValue.equalsIgnoreCase("image")) {
            return "Blod";
        } else {
            return "Long";
        }

    }


    /**
     * 驼峰转换
     */
    private static String columnToProperty(String column) {
        StringBuilder result = new StringBuilder();
        // 快速检查
        if (column == null || column.isEmpty()) {
            // 没必要转换
            return "";}
        else column =column.toLowerCase();
        
         if (!column.contains("_")) {
            // 不含下划线，仅将首字母小写
            return column.substring(0, 1).toLowerCase() + column.substring(1);
        } else {
            // 用下划线将原始字符串分割
            String[] columns = column.split("_");
            for (String columnSplit : columns) {
                // 跳过原始字符串中开头、结尾的下换线或双重下划线
                if (columnSplit.isEmpty()) {
                    continue;
                }
                // 处理真正的驼峰片段
                if (result.length() == 0) {
                    // 第一个驼峰片段，全部字母都小写
                    result.append(columnSplit.toLowerCase());
                } else {
                    // 其他的驼峰片段，首字母大写
                    result.append(columnSplit.substring(0, 1).toUpperCase()).append(columnSplit.substring(1).toLowerCase());
                }
            }
            return result.toString();
        }
    }

    /**
     * 实体名称转换
     */
    private static String formatBeanName(String column) {
        StringBuilder result = new StringBuilder();
        // 快速检查
        if (column == null || column.isEmpty()) {
            // 没必要转换
            return "";
        } else if (!column.contains("_")) {
            // 不含下划线，仅将首字母大写
            return column.substring(0, 1).toUpperCase() + column.substring(1);
        } else {
            // 用下划线将原始字符串分割
            String[] columns = column.split("_");
            for (String columnSplit : columns) {
                // 跳过原始字符串中开头、结尾的下换线或双重下划线
                if (columnSplit.isEmpty()) {
                    continue;
                }
                // 处理真正的驼峰片段
                result.append(columnSplit.substring(0, 1).toUpperCase()).append(columnSplit.substring(1).toLowerCase());
            }
            return result.toString();
        }
    }

    
    /**
     * 实体类字段
     */
    private static void getBean(String tableName,String aliasName) {
        getConnection = getConnections();
        StringBuilder sb = new StringBuilder();
        try {
            DatabaseMetaData dbmd = getConnection.getMetaData();
            ResultSet rs = dbmd.getColumns(null, "%", tableName, "%");
            String beanName = formatBeanName(aliasName);
            sb.append("package "+packageName+".entity;\n\n");
            sb.append("import com.baomidou.mybatisplus.annotation.TableName;\n");
            sb.append("import lombok.Data;\n");
            int length=sb.length();
            boolean dateFlag=false;
            sb.append(  " /**\n" +
	                    "  * @author " + author + "\n" +
	                    "  * @date "+ format.format(new Date())+"\n" +
	                    "  */\n" +
                        "@Data\n" +
                        "@TableName(\""+tableName+"\")\n" +
	                    "public class "+beanName+"Entity {\n");
            while (rs.next()) {
                if(formatType(rs.getString("TYPE_NAME")).equals("Date")){
                    dateFlag=true;
                }
                sb.append("\t//").append(rs.getString("REMARKS")).append(defaultValue(rs.getString("COLUMN_DEF"))).append("\n");
                sb.append("\tprivate ").append(formatType(rs.getString("TYPE_NAME"))).append(" ").append(columnToProperty(rs.getString("COLUMN_NAME"))).append(";\n");
            }
            sb.append("} ");
            if(dateFlag){
                sb.insert(length, "import java.util.Date;\n");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        write(sb.toString(),"Entity.java","entity");
        System.err.println("\n类型：JAVA数据层实体类（bean.java）" + "\n状态：成功" + "\n时间：" + format.format(new Date()) + "\n");
    }
    

    /**
     * 生成DAO层接口
     */
    private static void getMapper(String tableName,String aliasName) {
        StringBuilder sb = new StringBuilder();
        try {
            String beanName = formatBeanName(aliasName);
            sb.append("package "+packageName+".mapper;\n\n");
            sb.append("import com.baomidou.mybatisplus.core.mapper.BaseMapper;\n");
            sb.append("import "+packageName+".entity."+beanName+"Entity;\n");
            sb.append(  "/**\n" +
	                    " * @author " + author + "\n" +
	                    " * @date "+ format.format(new Date())+"\n" +
	                    " */\n" +
	                    "public interface "+beanName+"Mapper extends BaseMapper<"+beanName+"Entity>{\n" +
	                    " \n" +
	            		"}");
        } catch (Exception e) {
            e.printStackTrace();
        }
        write(sb.toString(),"Mapper.java","mapper");
        System.err.println("\n类型：JAVA数据持久层接口（dao.java）" + "\n状态：成功" + "\n时间：" + format.format(new Date()) + "\n");
    }

    
    /**
     * 生成SERVICE层接口
     */
    private static void getService(String tableName,String aliasName) {
        StringBuilder sb = new StringBuilder();
        try {
            String beanName = formatBeanName(aliasName);
            sb.append("package "+packageName+".service;\n\n");
            sb.append("import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;\n");
            sb.append("import org.springframework.stereotype.Service;\n");
            sb.append("import "+packageName+".mapper."+beanName+"Mapper;\n");
            sb.append("import "+packageName+".entity."+beanName+"Entity;\n");
            sb.append(  "/**\n" +
	                    " * @author " + author + "\n" +
	                    " * @date "+ format.format(new Date())+"\n" +
	                    " */\n" +
                        "@Service\n" +
	                    "public class "+beanName+"Service extends ServiceImpl<"+beanName+"Mapper, "+beanName+"Entity>{\n" +
	                    "\n" +
	            		"}");
        } catch (Exception e) {
            e.printStackTrace();
        }
        write(sb.toString(),"Service.java","service");
        System.err.println("\n类型：JAVA业务层接口（service.java）" + "\n状态：成功" + "\n时间：" + format.format(new Date()) + "\n");
       
    }

    /**
     * 写文件，支持中文字符，在linux redhad下测试过
     * @param str 文本内容
     * @param name 文本名称
     * */
    private static void write(String str, String name,String type) {
        try {
            File dir = new File(rootPathName +packagePath+ "/" + type);
            dir.mkdirs();
            String path = dir.getPath() + "/" + formatBeanName(aliasName)+name;
            File file = new File(path);
            if (!file.exists())
                file.createNewFile();
            
            FileOutputStream out = new FileOutputStream(file, false); //如果追加方式用true
            StringBuilder sb = new StringBuilder();
            sb.append(str + "\n");
            out.write(sb.toString().getBytes("utf-8"));//注意需要转换对应的字符集
            out.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //一次生产所有表
    private static void tableNames() {
        getConnection = getConnections();
        try {
            DatabaseMetaData dbmd = getConnection.getMetaData();
            ResultSet rs = dbmd.getTables(getConnection.getCatalog(), null, null, new String[] { "TABLE" });
            while (rs.next()) {
                tableName=rs.getString("TABLE_NAME");
                aliasName=getAliasName(tableName,"of_");
                //实体
                	getBean(tableName,aliasName);
                //dao层接口
                	getMapper(tableName,aliasName);
                //业务类接口
                	getService(tableName,aliasName);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


 
    public static void main(String[] args) {
    //  tableNames();
        //实体
    	getBean(tableName,aliasName);
    	//mapper接口
    	getMapper(tableName,aliasName);
        //业务类接口
    	getService(tableName,aliasName);
    }

}

  ``` 
  
生成文件截图 
实体 
 
  
mapper 
 
service 

                
        