// https://www.30secondsofcode.org/articles/s/nodejs-static-file-server
import fs from 'fs';
import http from 'http';
import path from 'path';

// 最基本的功能
// -> 接受、处理、响应
// 加入模块化
// -> 指定一个目录来提供文件，并使用改模块解析目录中的文件
// 安全
// -> 仅允许外部访问允许访问的内容
// 省略HTML扩展名
// -> 需要对缺失扩展名的请求路径进行判断是否存在相应的html文件
// 返回正确的内容类型
// -> 需根据文件类型返回的相应的内容类型

// path.normalize 规范化路径 处理“..” "\\\\"等
// path.resolve 将路径解析为绝对路径
// path.extname 获取文件路径的扩展名部分 根据路径最后出现句点“.”到路径字符串末尾这一部分的字符串 如果无扩展名则返回空串

type Types = {
    readonly html: 'text/html'
    readonly css: 'text/css'
    readonly js: 'application/javascript'
    readonly png: 'image/png'
    readonly jpg: 'image/jpg'
    readonly jpeg: 'image/jpeg'
    readonly gif: 'image/gif'
    readonly json: 'application/json'
    readonly xml: 'application/xml'
};

type TypesKey = keyof Types;

const DEBUG = true;
const PORT = 8000;
const DIRECTORY = './public';
const DEFAULT_FILE_NAME = 'index.html';
const TYPES: Types = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    json: 'application/json',
    xml: 'application/xml',
};

const root = path.normalize(path.resolve(DIRECTORY));

const server = http.createServer((req, res) => {
    const { method = 'get', url = '/' } = req;

    log(`${method} ${url}`);

    // 内容类型处理 -> 判断扩展名是否有效 无扩展名默认扩展名是html
    const extension = path.extname(url).slice(1) || 'html';
    if (!isType(extension)) {
        send404(res);
        return;
    }
    const type = TYPES[extension];

    // 省略HTML扩展名
    // 示例: “/index”的情况处理方式是把index当作子目录处理即“/index”处理为“/index/index.html” 而不是“/index.html”
    const fileName = url.endsWith(extension) ? url : path.join(url, DEFAULT_FILE_NAME);

    // 处理文件路径 -> 以提供的ROOT路径为根路径查找, 不得再往上查找
    const filePath = path.join(root, fileName);
    const isPathUnderRoot = path.normalize(path.resolve(filePath)).startsWith(root);
    if (!isPathUnderRoot) {
        send404(res);
        return;
    }

    try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': type });
        res.end(data);
    } catch {
        send404(res);
    }
});

server.listen(PORT, () => log(`Server is listening on port ${PORT}`));

function isType(str: string): str is TypesKey {
    return str in TYPES;
}

function send404(res: http.ServerResponse) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('404: File not found');
}

function log(str: string): void {
    if (!DEBUG) return;
    console.log(str);
}
