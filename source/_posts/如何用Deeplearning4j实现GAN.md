---
title: 推荐系列-如何用Deeplearning4j实现GAN
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 889
cover_picture: 'https://static.oschina.net/uploads/img/201909/11110431_DAy9.jpg'
abbrlink: 277ebbee
date: 2021-04-14 07:54:42
---

&emsp;&emsp;一、Gan的思想 Gan的核心所做的事情是在解决一个argminmax的问题，公式： 1、求解一个Discriminator，可以最大尺度的丈量Generator 产生的数据和真实数据之间的分布距离 2、求解一个Generat...
<!-- more -->

                                                                                                                                                                                        一、Gan的思想 
    Gan的核心所做的事情是在解决一个argminmax的问题，公式： 
    1、求解一个Discriminator，可以最大尺度的丈量Generator 产生的数据和真实数据之间的分布距离 
    2、求解一个Generator，可以最大程度减小产生数据和真实数据之间的距离 
    gan的原始公式如下： 
 
    实际上，我们不可能真求期望，只能sample出data来近似求解，于是，公式变成如下： 
 
    于是，求解V的最大值，变成了一个二分类问题，变成了求交叉熵的最小值。 
二、��码 
 ```java 
  public class Gan {
	static double lr = 0.01;

	public static void main(String[] args) throws Exception {

		final NeuralNetConfiguration.Builder builder = new NeuralNetConfiguration.Builder().updater(new Sgd(lr))
				.weightInit(WeightInit.XAVIER);

		final GraphBuilder graphBuilder = builder.graphBuilder().backpropType(BackpropType.Standard)
				.addInputs("input1", "input2")
				.addLayer("g1",
						new DenseLayer.Builder().nIn(10).nOut(128).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"input1")
				.addLayer("g2",
						new DenseLayer.Builder().nIn(128).nOut(512).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"g1")
				.addLayer("g3",
						new DenseLayer.Builder().nIn(512).nOut(28 * 28).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"g2")
				.addVertex("stack", new StackVertex(), "input2", "g3")
				.addLayer("d1",
						new DenseLayer.Builder().nIn(28 * 28).nOut(256).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"stack")
				.addLayer("d2",
						new DenseLayer.Builder().nIn(256).nOut(128).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"d1")
				.addLayer("d3",
						new DenseLayer.Builder().nIn(128).nOut(128).activation(Activation.RELU)
								.weightInit(WeightInit.XAVIER).build(),
						"d2")
				.addLayer("out", new OutputLayer.Builder(LossFunctions.LossFunction.XENT).nIn(128).nOut(1)
						.activation(Activation.SIGMOID).build(), "d3")
				.setOutputs("out");

		ComputationGraph net = new ComputationGraph(graphBuilder.build());
		net.init();
		System.out.println(net.summary());
		UIServer uiServer = UIServer.getInstance();
		StatsStorage statsStorage = new InMemoryStatsStorage();
		uiServer.attach(statsStorage);
		net.setListeners(new ScoreIterationListener(100));
		net.getLayers();
		DataSetIterator train = new MnistDataSetIterator(30, true, 12345);
	
		INDArray labelD = Nd4j.vstack(Nd4j.ones(30, 1), Nd4j.zeros(30, 1));

		INDArray labelG = Nd4j.ones(60, 1);

		for (int i = 1; i <= 100000; i++) {
			if (!train.hasNext()) {
				train.reset();
			}
			INDArray trueExp = train.next().getFeatures();
			INDArray z = Nd4j.rand(new long[] { 30, 10 }, new NormalDistribution());
			MultiDataSet dataSetD = new org.nd4j.linalg.dataset.MultiDataSet(new INDArray[] { z, trueExp },
					new INDArray[] { labelD });
			for(int m=0;m<10;m++){
				trainD(net, dataSetD);
			}
			z = Nd4j.rand(new long[] { 30, 10 }, new NormalDistribution());
			MultiDataSet dataSetG = new org.nd4j.linalg.dataset.MultiDataSet(new INDArray[] { z, trueExp },
					new INDArray[] { labelG });
			trainG(net, dataSetG);

			if (i % 10000 == 0) {
			   net.save(new File("E:/gan.zip"), true);
			}

		}

	}

	public static void trainD(ComputationGraph net, MultiDataSet dataSet) {
		net.setLearningRate("g1", 0);
		net.setLearningRate("g2", 0);
		net.setLearningRate("g3", 0);
		net.setLearningRate("d1", lr);
		net.setLearningRate("d2", lr);
		net.setLearningRate("d3", lr);
		net.setLearningRate("out", lr);
		net.fit(dataSet);
	}

	public static void trainG(ComputationGraph net, MultiDataSet dataSet) {
		net.setLearningRate("g1", lr);
		net.setLearningRate("g2", lr);
		net.setLearningRate("g3", lr);
		net.setLearningRate("d1", 0);
		net.setLearningRate("d2", 0);
		net.setLearningRate("d3", 0);
		net.setLearningRate("out", 0);
		net.fit(dataSet);
	}
}
  ```  
    说明： 
    1、dl4j并没有提供像keras那样冻结某些层参数的方法，这里采用设置learningrate为0的方法，来冻结某些层的参数 
    2、这个的更新器，用的是sgd，不能用其他的（比方说Adam、Rmsprop），因为这些自适应更新器会考虑前面batch的梯度作为本次更新的梯度，达不到不更新参数的目的 
    3、这里用了StackVertex，沿着第一维合并张量，也就是合并真实数据样本和Generator产生的数据样本，共同训练Discriminator 
    4、训练过程中多次update   Discriminator的参数，以便量出最大距离，让后更新Generator一次 
    5、进行10w次迭代 
三、Generator生成手写数字 
    加载训练好的模型，随机从NormalDistribution取出一些噪音数据，丢给模型，经过feedForward，取出最后一层Generator的激活值，便是我们想要的结果，代码如下： 
 ```java 
  public class LoadGan {

	public static void main(String[] args) throws Exception {
	    ComputationGraph restored = ComputationGraph.load(new File("E:/gan.zip"), true);
		
		DataSetIterator train = new MnistDataSetIterator(30, true, 12345);
		INDArray trueExp = train.next().getFeatures();
		Map<String, INDArray> map = restored.feedForward(
				new INDArray[] { Nd4j.rand(new long[] { 50, 10 }, new NormalDistribution()), trueExp }, false);
		INDArray indArray = map.get("g3");// .reshape(20,28,28);
		List<INDArray> list = new ArrayList<>();
		for (int j = 0; j < indArray.size(0); j++) {
			list.add(indArray.getRow(j));
		}
	    
		MNISTVisualizer bestVisualizer = new MNISTVisualizer(1, list, "Gan");

		bestVisualizer.visualize();
	}
	
	
	public static class MNISTVisualizer {
		private double imageScale;
		private List<INDArray> digits; // Digits (as row vectors), one per
										// INDArray
		private String title;
		private int gridWidth;

		public MNISTVisualizer(double imageScale, List<INDArray> digits, String title) {
			this(imageScale, digits, title, 5);
		}

		public MNISTVisualizer(double imageScale, List<INDArray> digits, String title, int gridWidth) {
			this.imageScale = imageScale;
			this.digits = digits;
			this.title = title;
			this.gridWidth = gridWidth;
		}

		public void visualize() {
			JFrame frame = new JFrame();
			frame.setTitle(title);
			frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

			JPanel panel = new JPanel();
			panel.setLayout(new GridLayout(0, gridWidth));

			List<JLabel> list = getComponents();
			for (JLabel image : list) {
				panel.add(image);
			}

			frame.add(panel);
			frame.setVisible(true);
			frame.pack();
		}

		public List<JLabel> getComponents() {
			List<JLabel> images = new ArrayList<>();
			for (INDArray arr : digits) {
				BufferedImage bi = new BufferedImage(28, 28, BufferedImage.TYPE_BYTE_GRAY);
				for (int i = 0; i < 784; i++) {
					bi.getRaster().setSample(i % 28, i / 28, 0, (int) (255 * arr.getDouble(i)));
				}
				ImageIcon orig = new ImageIcon(bi);
				Image imageScaled = orig.getImage().getScaledInstance((int) (imageScale * 28), (int) (imageScale * 28),
						Image.SCALE_DEFAULT);
				ImageIcon scaled = new ImageIcon(imageScaled);
				images.add(new JLabel(scaled));
			}
			return images;
		}
	}
}
  ```  
    实际效果，还算比较清晰 
  
  
快乐源于分享。 
   此博客乃作者原创， 转载请注明出处
                                        