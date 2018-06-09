const router = require('koa-router')();

// user BrowserHistory
const fs = require('fs');
const path = require('path');

// 解析绝对路径
function resolve(dir) {
  return path.join(__dirname, '..', dir);
}

const htmlFile = 'public/index.html';

// 404 重定向
// 匹配所有/*路由后，同步读取index.html并以type: html响应至客户端
router.get('/*', async (ctx) => {
  const html = fs.readFileSync(resolve(htmlFile));
  ctx.type = 'html';
  ctx.body = html;
});
// user HashHistory
// router.get('/', (ctx) => {
//   ctx.redirect('/public');
// });

module.exports = router;
