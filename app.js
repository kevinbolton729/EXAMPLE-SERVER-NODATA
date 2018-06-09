const Koa = require('koa');
const cors = require('koa2-cors');

const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
const logger = require('koa-logger');
const morgan = require('koa-morgan');
const path = require('path');
const fs = require('fs');
const rfs = require('rotating-file-stream');
const compress = require('koa-compress');

// 常量
const consts = require('./common/consts');

// 定义日志存储地址
const logDirectory = path.join(__dirname, 'logs');
// 确保存储日志文件目录存在
// ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}
// fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// 创建 rotating write stream
const accessLogStream = rfs('log-access.log', {
  interval: '1d', // rotate daily
  path: logDirectory,
});

// 监听错误
onerror(app);

// 中间件 middlewares
// 压缩
app.use(compress({ threshold: 10240 }));

// 跨域配置
app.use(cors({
  // 设置来源
  origin: (ctx) => {
    ctx.set('Content-Type', 'application/json;charset=utf-8');
    return ctx.headers.origin;
  },
  // 带cookie
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Accept'],
}));
// app.use((ctx, next) => {
//   ctx.set('Access-Control-Allow-Origin', ctx.headers.origin); // 设置来源
//   ctx.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
//   ctx.set('Access-Control-Allow-Credentials', true); // 带cookie
//   ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   ctx.set('Content-Type', 'application/json;charset=utf-8');

//   next();
// });

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
}));
app.use(json());
app.use(logger());
app.use(require('koa-static')(`${__dirname}/public`));

app.use(views(`${__dirname}/views`, {
  extension: 'pug',
}));

// 打印日志 logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
// 记录日志 morgan
// setup 日志 'combined'
// :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status
// :res[content-length] ":referrer" ":user-agent"
app.use(morgan('combined', { stream: accessLogStream }));

// 加载路由
const index = require('./routes/index');
// 使用入口的一级路由
app.use(index.routes(), index.allowedMethods());

// 404 重定向
app.use(async (ctx, next) => {
  const { response } = ctx;
  const { status } = response;
  await next();

  if (status === 404) {
    ctx.redirect('/');
  }
});

// 服务器信息
console.log(`>> 服务器已启动: http://${consts.HOSTNAME}:${consts.ENVPORT}`);

// 错误处理 error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);

  // err.status === 500
  // render the error page
  if (err.status === 500) {
    ctx.throw();
  }

  // err.status === 404时
  // 跳转路由至 '/'
  if (err.status === 404) {
    ctx.redirect('/');
  }
});

module.exports = app;
