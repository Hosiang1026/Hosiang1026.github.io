---
title: 推荐系列-如何使用Java AWT 创建一个简易计算器
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 291
cover_picture: 'https://pic4.zhimg.com/80/v2-255d219d833e21297b91ecd2d15d5073_720w.jpg'
abbrlink: 407da687
date: 2019-05-14 11:55:11
---

&emsp;&emsp;：手把手教你使用 Java AWT 创建一个简易计算器。 本文分享自华为云社区《手把手教你使用 Java AWT 创建一个简易计算器》，作者：海拥 。 关于AWT AWT （抽象窗口工具包）是一个有助于构...
<!-- more -->

                                                                                                                    
本文分享自华为云社区《手把手教你使用 Java AWT 创建一个简易计算器》，作者：海拥 。 
 
#### 关于AWT 
AWT （抽象窗口工具包）是一个有助于构建 GUI 的 API （图形用户界面）基于 java 应用程序。GUI使用一些图形帮助用户交互。它主要由一组的类和方法所必需的，如在一个简化的方式创建和管理的GUI按钮，窗口，框架，文本框，单选按钮 等等 
我所提供的Java代码对于动作监听器接口用于事件处理的计算器。 
 
 
#### 逻辑部分 
 
##### 1.对于数字按钮 
 
  
 ```java 
  if(e.getSource()==b1){ //b1 代表数字 1
 zt=l1.getText();
  z=zt+"1";// 1 将合并在前一个值的末尾
  l1.setText(z);
}
  ``` 
  
 
当按下任何数字按钮时，标签 l1 中的任何值都将存储在变量 zt 中，然后与相应的数字连接，然后显示在标签 l1 中，对于 NEGATIVE 和 DECIMAL PTS 按钮，我们也做了类似的处理 
 
##### 2.对于算术按钮 
 
  
 ```java 
  if(e.getSource()==badd){  //对应加法
    num1=Double.parseDouble(l1.getText());
  z="";
  l1.setText(z);
  check=1; 
}
  ``` 
  
 
现在，我们将标签 l1 的值转换为 double 类型后，将其存储到变量 num1 中，这在技术上将是第一个数字，然后将标签 l1 设置为 null 
我们将只使用一个检查变量来获取这个特定的气动按钮（这里是 +）被点击，这样我们就可以在我们的 = 按钮中执行这个操作 
 
##### 3.对于等号按钮 
 
  
 ```java 
  if(e.getSource()==bcalc){          
    num2=Double.parseDouble(l1.getText());
  if(check==1)
    xd =num1+num2;
  if(check==2)
    xd =num1-num2;
  if(check==3)
    xd =num1*num2;
  if(check==4)
    xd =num1/num2; 
  if(check==5)
    xd =num1%num2;    
  l1.setText(String.valueOf(xd));
}
  ``` 
  
 
现在再次将值存储 l1到 num2变量中，这将是算术上的第二个数字，然后检查变量的值，check然后进行相应的操作，然后在标签中显示结果 l1 
 
##### 4.对于清除按钮 
 
  
 ```java 
   if(e.getSource()==bclr){
  num1=0;
  num2=0;
  check=0;
  xd=0;
   z="";
   l1.setText(z);
   } 
  ``` 
  
 
此处将我们使用的所有变量更新为其默认值 0 
并将标签 l1 设置为 null，以便我们之后可以开始新的计算 
 
##### 5.对于退格按钮 
 
  
 ```java 
   if(e.getSource()==bback){  
  zt=l1.getText();
  try{
    z=zt.substring(0, zt.length()-1);
    }catch(StringIndexOutOfBoundsException f){return;}
  l1.setText(z);
}
  ``` 
  
 
这里只是l1通过使用substring函数删除最后一位数字来更新值 
并处理了一个 StringIndexOutOfBoundsException 当我们在标签中的值为 null 并且仍然按下返回按钮时发生的异常 
 
##### 6.特殊插件功能 
我所做的只是处理了 EQUAL 和所有 ARITHMETIC Buttons 中的一个异常，并根据情况打印了所需的消息 
算术按钮： 
 
  
 ```java 
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  ``` 
  
 
等于按钮： 
 
  
 ```java 
  try{
    num2=Double.parseDouble(l1.getText());
    }catch(Exception f){
      l1.setText("ENTER NUMBER FIRST ");
      return;
    }
  ``` 
  
 
当我们将值转换为双精度值时，但可以说，标签 l1 具有空值（即标签为空）并且我们仍然按下这些按钮，然后它将生成 NumberFormatException execption，所以处理并打印所需的消息。 
 
##### ==例如==： 
如果我点击1然后+然后我点击-而不是其他一些数字按钮，因此这是一个无效的格式，并且当-当时被点击时标签为空因此生成了execption所以只是处理它并在标签中打印无效格式 
类似地，当标签为空时，并且在这种情况下单击 = ENTER NUMBER FIRST 将显示在标签内 
至此，我们结束了本次 Java AWT 教程。 
 
#### GIF演示 
####  
 
#### 附完整代码： 
 
  
 ```java 
  import java.awt.*;  
import java.awt.event.*;  
class MyCalc extends WindowAdapter implements ActionListener{ 
  Frame f; 
Label l1;
Button b1,b2,b3,b4,b5,b6,b7,b8,b9,b0;
Button badd,bsub,bmult,bdiv,bmod,bcalc,bclr,bpts,bneg,bback;
double xd;
double num1,num2,check;

MyCalc(){  
  f= new Frame("MY CALCULATOR");
// 实例化组件
l1=new Label(); 
l1.setBackground(Color.LIGHT_GRAY);
l1.setBounds(50,50,260,60);
b1=new Button("1");
  b1.setBounds(50,340,50,50);
b2=new Button("2");
  b2.setBounds(120,340,50,50);
b3=new Button("3");
  b3.setBounds(190,340,50,50);
b4=new Button("4");
  b4.setBounds(50,270,50,50);
b5=new Button("5");
  b5.setBounds(120,270,50,50); 
b6=new Button("6");
  b6.setBounds(190,270,50,50);
b7=new Button("7");
  b7.setBounds(50,200,50,50);
b8=new Button("8");
  b8.setBounds(120,200,50,50);
b9=new Button("9");
  b9.setBounds(190,200,50,50);
b0=new Button("0");
  b0.setBounds(120,410,50,50);
bneg=new Button("+/-");
  bneg.setBounds(50,410,50,50);
bpts=new Button(".");
  bpts.setBounds(190,410,50,50);
bback=new Button("back");
 bback.setBounds(120,130,50,50);

badd=new Button("+");
  badd.setBounds(260,340,50,50);
bsub=new Button("-");
  bsub.setBounds(260,270,50,50);
bmult=new Button("*");
  bmult.setBounds(260,200,50,50);
bdiv=new Button("/");
  bdiv.setBounds(260,130,50,50);
bmod=new Button("%");
  bmod.setBounds(190,130,50,50);
bcalc=new Button("=");
  bcalc.setBounds(245,410,65,50);
bclr=new Button("CE"); 
  bclr.setBounds(50,130,65,50);
b1.addActionListener(this); 
b2.addActionListener(this);  
b3.addActionListener(this);  
b4.addActionListener(this);  
b5.addActionListener(this); 
b6.addActionListener(this); 
b7.addActionListener(this); 
b8.addActionListener(this); 
b9.addActionListener(this);  
b0.addActionListener(this);

bpts.addActionListener(this);  
bneg.addActionListener(this);
bback.addActionListener(this); 

badd.addActionListener(this);
bsub.addActionListener(this);
bmult.addActionListener(this);
bdiv.addActionListener(this);
bmod.addActionListener(this);
bcalc.addActionListener(this);
bclr.addActionListener(this); 

f.addWindowListener(this);
//添加到框架
f.add(l1);  
f.add(b1); f.add(b2); f.add(b3); f.add(b4); f.add(b5);f.add(b6); f.add(b7); f.add(b8);f.add(b9);f.add(b0);

f.add(badd); f.add(bsub); f.add(bmod); f.add(bmult); f.add(bdiv); f.add(bmod);f.add(bcalc);

f.add(bclr); f.add(bpts);f.add(bneg); f.add(bback);

f.setSize(360,500);  
f.setLayout(null);  
f.setVisible(true);  
} 
                     //关闭窗口
public void windowClosing(WindowEvent e) {
  f.dispose();
}

public void actionPerformed(ActionEvent e){ 
  String z,zt;
                        //数字按钮
if(e.getSource()==b1){
 zt=l1.getText();
  z=zt+"1";
  l1.setText(z);
}
if(e.getSource()==b2){
zt=l1.getText();
z=zt+"2";
l1.setText(z);
}
if(e.getSource()==b3){
  zt=l1.getText();
  z=zt+"3";
  l1.setText(z);
}
if(e.getSource()==b4){
  zt=l1.getText();
  z=zt+"4";
  l1.setText(z);
}
if(e.getSource()==b5){
  zt=l1.getText();
  z=zt+"5";
  l1.setText(z);
}
if(e.getSource()==b6){
  zt=l1.getText();
  z=zt+"6";
  l1.setText(z);
}
if(e.getSource()==b7){
  zt=l1.getText();
  z=zt+"7";
  l1.setText(z);
}
if(e.getSource()==b8){
  zt=l1.getText();
  z=zt+"8";
  l1.setText(z);
}
if(e.getSource()==b9){
  zt=l1.getText();
  z=zt+"9";
  l1.setText(z);
}
if(e.getSource()==b0){
  zt=l1.getText();
  z=zt+"0";
  l1.setText(z);
}

if(e.getSource()==bpts){  //添加小数点
  zt=l1.getText();
  z=zt+".";
  l1.setText(z);
}
if(e.getSource()==bneg){ //对于减
  zt=l1.getText();
  z="-"+zt;
  l1.setText(z);
}

if(e.getSource()==bback){  // 退格用
  zt=l1.getText();
  try{
    z=zt.substring(0, zt.length()-1);
    }catch(StringIndexOutOfBoundsException f){return;}
  l1.setText(z);
}
                //算术按钮
if(e.getSource()==badd){                     //对应加法
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  z="";
  l1.setText(z);
  check=1;
}
if(e.getSource()==bsub){                    //对应减法
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  z="";
  l1.setText(z);
  check=2;
}
if(e.getSource()==bmult){                   //对应乘法
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  z="";
  l1.setText(z);
  check=3;
}
if(e.getSource()==bdiv){                   //对应除法
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  z="";
  l1.setText(z);
  check=4;
}
if(e.getSource()==bmod){                  //对应MOD/剩余
  try{
    num1=Double.parseDouble(l1.getText());
    }catch(NumberFormatException f){
      l1.setText("Invalid Format");
      return;
    }
  z="";
  l1.setText(z);
  check=5;
}
                         //结果按钮
if(e.getSource()==bcalc){          
  try{
    num2=Double.parseDouble(l1.getText());
    }catch(Exception f){
      l1.setText("ENTER NUMBER FIRST ");
      return;
    }
  if(check==1)
    xd =num1+num2;
  if(check==2)
    xd =num1-num2;
  if(check==3)
    xd =num1*num2;
  if(check==4)
    xd =num1/num2; 
  if(check==5)
    xd =num1%num2;    
  l1.setText(String.valueOf(xd));
}
                        //清除标签和内存
if(e.getSource()==bclr){
  num1=0;
  num2=0;
  check=0;
  xd=0;
   z="";
   l1.setText(z);
   } 

}  
//实例化 MyCalc 对象的 main 方法
 public static void main(String args[]){  
       new MyCalc();  
   }
}  
  ``` 
  
 
  
点击关注，第一时间了解华为云新鲜技术~
                                        