if(!self.define){let e,s={};const i=(i,c)=>(i=new URL(i+".js",c).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(c,n)=>{const a=e||("document"in self?document.currentScript.src:"")||location.href;if(s[a])return;let t={};const r=e=>i(e,a),o={module:{uri:a},exports:t,require:r};s[a]=Promise.all(c.map((e=>o[e]||r(e)))).then((e=>(n(...e),t)))}}define(["./workbox-81180080"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/server/middleware-build-manifest.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/server/middleware-react-loadable-manifest.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/7LLcCztkQy_VmUQ7ucZjG/_buildManifest.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/7LLcCztkQy_VmUQ7ucZjG/_ssgManifest.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/ef6529d7-437f74008ca6284e.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/framework-3b5a00d5d7e8d93b.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/main-21e705a101af0ecf.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/_app-7c58ed9d9564f1c2.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/_error-8353112a01355ec2.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/gifts-7c6fcb65eaa0dbab.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/index-dd0f4e5acdef8158.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/login-e789aabe5e98e850.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/users-b5d0875cb42f4041.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/users/%5Buid%5D-6536ea1933697ae9.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/users/%5Buid%5D/%5Bgid%5D-574e3f4ec5d1a547.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/users/%5Buid%5D/%5Bgid%5D/edit-8b884201630c4fdf.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/pages/users/%5Buid%5D/gift-58b04a52d6a3d0b1.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/chunks/webpack-f6a1ec1769943cd6.js",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/170f44436ab5b633.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/510f97e3c905d23e.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/8f5801c563ce9790.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/bd19100a8ff381a5.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/d9ebc428f894f8f0.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/ef46db3751d8e999.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/_next/static/css/fbdbae752e70afea.css",revision:"7LLcCztkQy_VmUQ7ucZjG"},{url:"/favicon.ico",revision:"758747c5341e0377f6d9ac2655fce337"},{url:"/images/en.png",revision:"83c5cc475dc87108d7c991a56fd7f6f2"},{url:"/images/fi.png",revision:"74bda7769ee5553d5732ab70801203b4"},{url:"/images/icon.png",revision:"cacf048c2ed472d48c0e21d364453d16"},{url:"/images/icons/bauble-alt.png",revision:"348b25652014a74d8b3f56a18c1c266e"},{url:"/images/icons/bauble.png",revision:"20741c4eef878636e3fbf624dc775aac"},{url:"/images/icons/calendar.png",revision:"8f35abfca2c2981b7a95193da2e7df1b"},{url:"/images/icons/candy-cane.png",revision:"fe0c29562be594678a96c1cf1fd54b96"},{url:"/images/icons/candycane.png",revision:"623d9e2aabe8aee961fb6d1d884caf26"},{url:"/images/icons/christmas-tree.png",revision:"4cf83e5b37ccd41180fd094c24be1c64"},{url:"/images/icons/english.png",revision:"6e1f6310eb9aa67f2d49e125202fc109"},{url:"/images/icons/facebook.svg",revision:"1f10bd120074e1e7eb26178e70fc1041"},{url:"/images/icons/finnish.png",revision:"d5e66d219aa50221505fe90094100647"},{url:"/images/icons/fireplace.png",revision:"90e149b059a6aa5c14543437dccfb095"},{url:"/images/icons/frame.png",revision:"d923c1d91ba785705086df06a6695d60"},{url:"/images/icons/gift-alt.png",revision:"783bae6b6fb275bf4f841d127e4888d4"},{url:"/images/icons/gift-bag.png",revision:"5fea5e56ce801c649b9e716e5dbc93fe"},{url:"/images/icons/gift.png",revision:"e2c58f553418328984838348ba2fb7e7"},{url:"/images/icons/gingerbread.png",revision:"fd27a6d3269b93e948ff5e42965d2077"},{url:"/images/icons/globe.png",revision:"694433b8e41e69ae73a91588f9a5d141"},{url:"/images/icons/greeting-card.png",revision:"2c0203b73592b0f7167684ec2436bac2"},{url:"/images/icons/jar.png",revision:"d3cea2a6ca5d18abc9b92de1ecadf379"},{url:"/images/icons/merry-christmas.png",revision:"96bf6d27d791b5319d9afd160c2d6328"},{url:"/images/icons/mistletoe.png",revision:"48b9cf12603ff87464b71bf85e11dbcf"},{url:"/images/icons/ornament.png",revision:"3c95d2adf0d1cbeb3f34007f5bd1b29e"},{url:"/images/icons/reindeer.png",revision:"856abb0d6ec72cbe9455fdce131ec218"},{url:"/images/icons/santa-claus.png",revision:"2118a4df2f35ae30e31c3a1f47a6b9e4"},{url:"/images/icons/santa-hat.png",revision:"36dbce4cd45f524f2015ea277e140add"},{url:"/images/icons/snowflake.png",revision:"33bdee04c6bdeb4bec169f96e750bd58"},{url:"/images/icons/snowman.png",revision:"8faa38753b9b92bc2357e3ce369a2ae9"},{url:"/images/icons/sock.png",revision:"3372a06394e9aa9d53ac24c51557dfff"},{url:"/images/icons/tag.png",revision:"b621717371563b8f4cae27beed04b289"},{url:"/images/icons/wreath.png",revision:"24c371ba3abceb7d882920f6d183c5c3"},{url:"/images/logo192.png",revision:"e4073161f26ca546e0c279bb62032044"},{url:"/images/logo512.png",revision:"57bbc635cb8f9287beca9ddb2237d910"},{url:"/manifest.json",revision:"c94af104f8bd4b6217444c16418db0e5"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:i,state:c})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|mp4)$/i,new e.StaleWhileRevalidate({cacheName:"static-media-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/^\/api\/(?!auth\/callback\/).*$/i,new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/^\/(?!api\/).*$/i,new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET")}));
