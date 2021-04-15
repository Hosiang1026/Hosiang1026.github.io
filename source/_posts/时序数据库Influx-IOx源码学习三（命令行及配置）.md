---
title: 推荐系列-时序数据库Influx-IOx源码学习三（命令行及配置）
categories: 热门文章
tags:
  - Popular
author: OSChina
top: 1929
cover_picture: 'https://oscimg.oschina.net/oscnet/up-ff1bc9f8b1f1ae755daac24784c180cebaf.png'
abbrlink: 35be3808
date: 2021-04-15 09:46:45
---

&emsp;&emsp;欢迎关注公众号: 上篇介绍到：InfluxDB-IOx的环境搭建,详情见：https://my.oschina.net/u/3374539/blog/5016798 本章开始，讲解启动的主流程！ 打开src/main.rs文件可以找到下面的代码 fn m...
<!-- more -->

                                                                                                                                                                                         
上篇介绍到：InfluxDB-IOx的环境搭建,详情见：https://my.oschina.net/u/3374539/blog/5016798 
本章开始，讲解启动的主流程！ 
打开 
 ```java 
  src/main.rs
  ``` 
 文件可以找到下面的代码 
 
 ```java 
  fn main() -> Result<(), std::io::Error> {
    // load all environment variables from .env before doing anything
    load_dotenv();

    let config = Config::from_args();
    println!("{:?}", config);
   
    //省略
    .....
    
    Ok(())
}

  ``` 
  
在 
 ```java 
  main
  ``` 
 方法中映入眼帘的第一行就是 
 ```java 
  load_dotenv()
  ``` 
 方法，然后是 
 ```java 
  Config::from_args()
  ``` 
 接下来就分别跟踪这两个方法，看明白是怎么工作的。 
#### 加载配置文件 
在 
 ```java 
  README
  ``` 
 文件中，我们可以看到这样一行： 
 
意思就是这个工程使用的配置文件，名字是 
 ```java 
  .env
  ``` 
 。了解这个特殊的名字之后，我们看代码 
 ```java 
  src/main.rs:276
  ``` 
 ： 
 
 ```java 
  fn load_dotenv() {
    //调用dotenv方法，并对其返回值进行判断
    match dotenv() {
        //如果返回成��，程序什么都不做，继续执行。
        Ok(_) => {}
        //返回的是错误，那么判断一下是否为'未找到'错误，
        //如果是未找到，那么就什么都不做（也就是有默认值填充）
        Err(dotenv::Error::Io(err)) if err.kind() == std::io::ErrorKind::NotFound => {
        }
        //这里就是真真正正必须要处理的错误了，直接退出程序
        Err(e) => {
            eprintln!("FATAL Error loading config from: {}", e);
            eprintln!("Aborting");
            std::process::exit(1);
        }
    };
}

  ``` 
  
然后跟踪 
 ```java 
  dotenv()
  ``` 
 方法看看如何执行(这里就进入了dotenv这个crate了)：  
 ```java 
  为了方便写，我就直接把所有调用，从上到下的顺序全都写出来了
  ``` 
  
 
 ```java 
  //返回一个PathBuf的Result，之后再看这个Result
pub fn dotenv() -> Result<PathBuf> {
    //new一个Finder结构并调用find方法
    //?代表错误的时候直接抛出错误
    let (path, iter) = Finder::new().find()?;
    //返回一个自定义的Iter结构，并调用load方法
    iter.load()?;
    //成功返回
    Ok(path)
}
//创建一个Finder结构体，filename使用`.env`填充
 pub fn new() -> Self {
        Finder {
            filename: Path::new(".env"),
        }
 }
//返回一个元组，多个返回值，(路径，文件读取相关记录)
pub fn find(self) -> Result<(PathBuf, Iter<File>)> {
        //使用标准库中的current_dir()方法得到当前的路径
        //出错就返回Error::Io错误，正常就调用find方法
        let path = find(&env::current_dir().map_err(Error::Io)?, self.filename)?;
        //如果找到了.env文件就打开，打开错误就返回Error::Io错误
        let file = File::open(&path).map_err(Error::Io)?;
        //使用打开的文件创建一个Iter的结构
        let iter = Iter::new(file);
        //返回
        Ok((path, iter))
 }
 //递归查找.env文件
 pub fn find(directory: &Path, filename: &Path) -> Result<PathBuf> {
    //拼装一个全路径
    let candidate = directory.join(filename);
    //尝试打开这个文件
    match fs::metadata(&candidate) {
        //成功打开了，说明找到了.env文件，就返回成功
        //但我有个疑问文件内容为啥不校验一下呢？
        Ok(metadata) => if metadata.is_file() {
            return Ok(candidate);
        },
        //除了没找到文件的错误之外，其它错误都直接返回异常
        Err(error) => {
            if error.kind() != io::ErrorKind::NotFound {
                return Err(Error::Io(error));
            }
        }
    }
    //没找到的时候，就返回到父级文件夹里，继续找，一直到根文件夹
    if let Some(parent) = directory.parent() {
        find(parent, filename)
    } else {
        //一直到根文件夹，还没找到就返回一个NotFound的IO错误，
        //这个在上面的代码中提到，这个错误会被忽略
        Err(Error::Io(io::Error::new(io::ErrorKind::NotFound, "path not found")))
    }
}

  //对应的iter.load()?;方法实现
  pub fn load(self) -> Result<()> {
        //可以使用for是因为实现了Iterator 这个trait
        for item in self {
            //获取读取出来的一行一行的配置项
            let (key, value) = item?;
            //验证key没有什么问题，就放到env中
            if env::var(&key).is_err() {
                env::set_var(&key, value);
            }
        }
        Ok(())
    }
// 为了能够for循环，实现的Iterator
impl<R: Read> Iterator for Iter<R> {
    type Item = Result<(String, String)>;

    fn next(&mut self) -> Option<Self::Item> {
        loop {
           //一行一行的读取文件内容
            let line = match self.lines.next() {
                Some(Ok(line)) => line,
                Some(Err(err)) => return Some(Err(Error::Io(err))),
                None => return None,
            };
            //解析配置项目，这里就不在深入跟了
            match parse::parse_line(&line, &mut self.substitution_data) {
                Ok(Some(result)) => return Some(Ok(result)),
                Ok(None) => {}
                Err(err) => return Some(Err(err)),
            }
        }
    }
}

  ``` 
  
研究这里的时候，我发现了一个比较好玩儿的东西就是返回值的 
 ```java 
  Result<PathBuf>
  ``` 
 ���标准库的定义中，Result是有两个值，分别是<T,E>。 
 
 ```java 
  自定义的类型，节省了Error这个模板代码
pub type Result<T> = std::result::Result<T, Error>;

//Error也自己定义
pub enum Error {
    LineParse(String, usize),
    Io(io::Error),
    EnvVar(std::env::VarError),
    #[doc(hidden)]
    __Nonexhaustive
}

//实现一个not_found()的方法来判断是否为not_found的一个错误类型
impl Error {
    pub fn not_found(&self) -> bool {
        if let Error::Io(ref io_error) = *self {
            return io_error.kind() == io::ErrorKind::NotFound;
        }
        false
    }
}

//实现标准库中的error::Error这个trait
impl error::Error for Error {
    //追踪错误的上一级，应该是打印堆栈这种功能
    //如果内部有错误类型Err返回：Some(e),如果没有返回：None
    //关于'static这个生命周期的标注，我也不是很理解
    //是指存储的错误生命周期足够长还是什么？
    fn source(&self) -> Option<&(dyn error::Error + 'static)> {
        match self {
            Error::Io(err) => Some(err),
            Error::EnvVar(err) => Some(err),
            _ => None,
        }
    }
}
//实现错误的打印
impl fmt::Display for Error {
    fn fmt(&self, fmt: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Error::Io(err) => write!(fmt, "{}", err),
            Error::EnvVar(err) => write!(fmt, "{}", err),
            Error::LineParse(line, error_index) => write!(fmt, "Error parsing line: '{}', error at line index: {}", line, error_index),
            _ => unreachable!(),
        }
    }
}

  ``` 
  
更详细的rust错误处理，可以参见：https://zhuanlan.zhihu.com/p/109242831 
#### 命令行参数 
在main方法中我们可以看到第二行， 
 
 ```java 
  let config = Config::from_args();

  ``` 
  
这是 
 ```java 
  influx
  ``` 
 使用了 
 ```java 
  structopt
  ``` 
 这个 
 ```java 
  crate
  ``` 
 ，调用该方法后，程序会根据结构体上的 
 ```java 
  #[structopt()]
  ``` 
 中的参数进行执行命令行解析。 
 
 ```java 
  #[derive(Debug, StructOpt)]
#[structopt(
//cargo的crate名字
name = "influxdb_iox",
//打印出来介绍
about = "InfluxDB IOx server and command line tools",
long_about = // 省略 ...
)]
struct Config {
    // from_occurrences代表出现了几次，就是-vvv的时候v出现的次数
    #[structopt(short, long, parse(from_occurrences))]
    verbose: u64,
    #[structopt(
    short,
    long,
    global = true,
    env = "IOX_ADDR",
    default_value = "http://127.0.0.1:8082"
    )]
    host: String,
    #[structopt(long)]
    num_threads: Option<usize>,
    //subcommand代表是一个子类型的，
    //具体还有什么命令行要去子类型里继续解析，
    //这个字段不展示在命令行中
    #[structopt(subcommand)]
    command: Command,
}

//在influx的命令行中提供了8个主要的命令，
//在上一章中使用到的run参数就是属于Run(Box<commands::run::Config>)里的调用。
//这里都是subcommand，需要继续解析，这个在以后学习每个具体功能的时候再分析
#[derive(Debug, StructOpt)]
enum Command {
    Convert { // 省略 ...},
    Meta {// 省略 ...},
    Database(commands::database::Config),
    Run(Box<commands::run::Config>),
    Stats(commands::stats::Config),
    Server(commands::server::Config),
    Writer(commands::writer::Config),
    Operation(commands::operations::Config),
}

  ``` 
  
下面通过打印出来的例子来对应 
 ```java 
  structopt
  ``` 
 中的内容。 
 
 ```java 
  $ ./influxdb_iox -vvvv run
Config { verbose: 4, host: "http://127.0.0.1:8082", num_threads: None, command: Run(Config { rust_log: None, log_format: None, verbose_count: 0, writer_id: None, http_bind_address: 127.0.0.1:8080, grpc_bind_address: 127.0.0.1:8082, database_directory: None, object_store: None, bucket: None, aws_access_key_id: None, aws_secret_access_key: None, aws_default_region: "us-east-1", google_service_account: None, azure_storage_account: None, azure_storage_access_key: None, jaeger_host: None }) }

  ``` 
  
可以看到，我们执行了 
 ```java 
  Run
  ``` 
 这个变体的 
 ```java 
  Subcommand
  ``` 
 ，并且指定了 
 ```java 
  Config
  ``` 
 结构体中的 
 ```java 
  verbose
  ``` 
  4 次， 
 ```java 
  IOx
  ``` 
 也成功的识别了。 
后面继续学习程序的启动过程，祝玩儿的开心！
                                        