const c2pa = require('c2pa-node');
console.log('Exports:', Object.keys(c2pa));
if (c2pa.createC2pa) console.log('createC2pa is function');
if (c2pa.read) console.log('read is function');
try {
    const instance = c2pa.createC2pa ? c2pa.createC2pa({}) : null;
    console.log('Instance keys:', instance ? Object.keys(instance) : 'null');
} catch (e) { console.log('Init error:', e.message) }
