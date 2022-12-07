"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[103],{8665:(e,t,a)=>{a.d(t,{Z:()=>h});var l=a(7294),n=a(6010),r=a(2600),i=a(9960);const s="sidebar_a9qW",m="sidebarItemTitle_uKok",o="sidebarItemList_Kvuv",c="sidebarItem_CF0Q",d="sidebarItemLink_miNk",g="sidebarItemLinkActive_RRTD";var u=a(5999);function p(e){let{sidebar:t}=e;return 0===t.items.length?null:l.createElement("nav",{className:(0,n.Z)(s,"thin-scrollbar"),"aria-label":(0,u.I)({id:"theme.blog.sidebar.navAriaLabel",message:"Blog recent posts navigation",description:"The ARIA label for recent posts in the blog sidebar"})},l.createElement("div",{className:(0,n.Z)(m,"margin-bottom--md")},t.title),l.createElement("ul",{className:o},t.items.map((e=>l.createElement("li",{key:e.permalink,className:c},l.createElement(i.Z,{isNavLink:!0,to:e.permalink,className:d,activeClassName:g},e.title))))))}function h(e){const{sidebar:t,toc:a,children:i,...s}=e,m=t&&t.items.length>0;return l.createElement(r.Z,s,l.createElement("div",{className:"container margin-vert--lg"},l.createElement("div",{className:"row"},m&&l.createElement("aside",{className:"col col--3"},l.createElement(p,{sidebar:t})),l.createElement("main",{className:(0,n.Z)("col",{"col--7":m,"col--9 col--offset-1":!m}),itemScope:!0,itemType:"http://schema.org/Blog"},i),a&&l.createElement("div",{className:"col col--2"},a))))}},8561:(e,t,a)=>{a.d(t,{Z:()=>k});var l=a(7294),n=a(6010),r=a(5999),i=a(9960),s=a(4996),m=a(1548),o=a(8780),c=a(8976),d=a(6753);const g="blogPostTitle_rzP5",u="blogPostData_Zg1s",p="blogPostDetailsFull_h6_j";var h=a(62);const b="image_o0gy";function E(e){return e.href?l.createElement(i.Z,e):l.createElement(l.Fragment,null,e.children)}function v(e){let{author:t}=e;const{name:a,title:n,url:r,imageURL:i,email:s}=t,m=r||s&&`mailto:${s}`||void 0;return l.createElement("div",{className:"avatar margin-bottom--sm"},i&&l.createElement("span",{className:"avatar__photo-link avatar__photo"},l.createElement(E,{href:m},l.createElement("img",{className:b,src:i,alt:a}))),a&&l.createElement("div",{className:"avatar__intro",itemProp:"author",itemScope:!0,itemType:"https://schema.org/Person"},l.createElement("div",{className:"avatar__name"},l.createElement(E,{href:m,itemProp:"url"},l.createElement("span",{itemProp:"name"},a))),n&&l.createElement("small",{className:"avatar__subtitle",itemProp:"description"},n)))}const _="authorCol_FlmR",N="imageOnlyAuthorRow_trpF",f="imageOnlyAuthorCol_S2np";function Z(e){let{authors:t,assets:a}=e;if(0===t.length)return null;const r=t.every((e=>{let{name:t}=e;return!t}));return l.createElement("div",{className:(0,n.Z)("margin-top--md margin-bottom--sm",r?N:"row")},t.map(((e,t)=>l.createElement("div",{className:(0,n.Z)(!r&&"col col--6",r?f:_),key:t},l.createElement(v,{author:{...e,imageURL:a.authorsImageUrls[t]??e.imageURL}})))))}function k(e){const t=function(){const{selectMessage:e}=(0,m.c2)();return t=>{const a=Math.ceil(t);return e(a,(0,r.I)({id:"theme.blog.post.readingTime.plurals",description:'Pluralized label for "{readingTime} min read". Use as much plural forms (separated by "|") as your language support (see https://www.unicode.org/cldr/cldr-aux/charts/34/supplemental/language_plural_rules.html)',message:"One min read|{readingTime} min read"},{readingTime:a}))}}(),{withBaseUrl:a}=(0,s.C)(),{children:b,frontMatter:E,assets:v,metadata:_,truncated:N,isBlogPostPage:f=!1}=e,{date:k,formattedDate:P,permalink:L,tags:C,readingTime:T,title:y,editUrl:w,authors:I}=_,x=v.image??E.image,A=!f&&N,M=C.length>0,R=f?"h1":"h2";return l.createElement("article",{className:f?void 0:"margin-bottom--xl",itemProp:"blogPost",itemScope:!0,itemType:"http://schema.org/BlogPosting"},l.createElement("header",null,l.createElement(R,{className:g,itemProp:"headline"},f?y:l.createElement(i.Z,{itemProp:"url",to:L},y)),l.createElement("div",{className:(0,n.Z)(u,"margin-vert--md")},l.createElement("time",{dateTime:k,itemProp:"datePublished"},P),void 0!==T&&l.createElement(l.Fragment,null," \xb7 ",t(T))),l.createElement(Z,{authors:I,assets:v})),x&&l.createElement("meta",{itemProp:"image",content:a(x,{absolute:!0})}),l.createElement("div",{id:f?o.blogPostContainerID:void 0,className:"markdown",itemProp:"articleBody"},l.createElement(c.Z,null,b)),(M||N)&&l.createElement("footer",{className:(0,n.Z)("row docusaurus-mt-lg",f&&p)},M&&l.createElement("div",{className:(0,n.Z)("col",{"col--9":A})},l.createElement(h.Z,{tags:C})),f&&w&&l.createElement("div",{className:"col margin-top--sm"},l.createElement(d.Z,{editUrl:w})),A&&l.createElement("div",{className:(0,n.Z)("col text--right",{"col--3":M})},l.createElement(i.Z,{to:_.permalink,"aria-label":(0,r.I)({message:"Read more about {title}",id:"theme.blog.post.readMoreLabel",description:"The ARIA label for the link to full blog posts from excerpts"},{title:y})},l.createElement("b",null,l.createElement(r.Z,{id:"theme.blog.post.readMore",description:"The label used in blog post item excerpts to link to full blog posts"},"Read More"))))))}},9360:(e,t,a)=>{a.r(t),a.d(t,{default:()=>h});var l=a(7294),n=a(8665),r=a(8561),i=a(7462),s=a(5999),m=a(1750);function o(e){const{nextItem:t,prevItem:a}=e;return l.createElement("nav",{className:"pagination-nav docusaurus-mt-lg","aria-label":(0,s.I)({id:"theme.blog.post.paginator.navAriaLabel",message:"Blog post page navigation",description:"The ARIA label for the blog posts pagination"})},l.createElement("div",{className:"pagination-nav__item"},a&&l.createElement(m.Z,(0,i.Z)({},a,{subLabel:l.createElement(s.Z,{id:"theme.blog.post.paginator.newerPost",description:"The blog post button label to navigate to the newer/previous post"},"Newer Post")}))),l.createElement("div",{className:"pagination-nav__item pagination-nav__item--next"},t&&l.createElement(m.Z,(0,i.Z)({},t,{subLabel:l.createElement(s.Z,{id:"theme.blog.post.paginator.olderPost",description:"The blog post button label to navigate to the older/next post"},"Older Post")}))))}var c=a(1548),d=a(1575),g=a(6010);function u(e){const{content:t}=e,{assets:a,metadata:n}=t,{title:r,description:i,date:s,tags:m,authors:o,frontMatter:d}=n,{keywords:g}=d,u=a.image??d.image;return l.createElement(c.d,{title:r,description:i,keywords:g,image:u},l.createElement("meta",{property:"og:type",content:"article"}),l.createElement("meta",{property:"article:published_time",content:s}),o.some((e=>e.url))&&l.createElement("meta",{property:"article:author",content:o.map((e=>e.url)).filter(Boolean).join(",")}),m.length>0&&l.createElement("meta",{property:"article:tag",content:m.map((e=>e.label)).join(",")}))}function p(e){const{content:t,sidebar:a}=e,{assets:i,metadata:s}=t,{nextItem:m,prevItem:c,frontMatter:g}=s,{hide_table_of_contents:u,toc_min_heading_level:p,toc_max_heading_level:h}=g;return l.createElement(n.Z,{sidebar:a,toc:!u&&t.toc&&t.toc.length>0?l.createElement(d.Z,{toc:t.toc,minHeadingLevel:p,maxHeadingLevel:h}):void 0},l.createElement(r.Z,{frontMatter:g,assets:i,metadata:s,isBlogPostPage:!0},l.createElement(t,null)),(m||c)&&l.createElement(o,{nextItem:m,prevItem:c}))}function h(e){return l.createElement(c.FG,{className:(0,g.Z)(c.kM.wrapper.blogPages,c.kM.page.blogPostPage)},l.createElement(u,e),l.createElement(p,e))}},6753:(e,t,a)=>{a.d(t,{Z:()=>c});var l=a(7294),n=a(5999),r=a(7462),i=a(6010);const s="iconEdit_dcUD";function m(e){let{className:t,...a}=e;return l.createElement("svg",(0,r.Z)({fill:"currentColor",height:"20",width:"20",viewBox:"0 0 40 40",className:(0,i.Z)(s,t),"aria-hidden":"true"},a),l.createElement("g",null,l.createElement("path",{d:"m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z"})))}var o=a(1548);function c(e){let{editUrl:t}=e;return l.createElement("a",{href:t,target:"_blank",rel:"noreferrer noopener",className:o.kM.common.editThisPage},l.createElement(m,null),l.createElement(n.Z,{id:"theme.common.editThisPage",description:"The link label to edit the current page"},"Edit this page"))}},1750:(e,t,a)=>{a.d(t,{Z:()=>r});var l=a(7294),n=a(9960);function r(e){const{permalink:t,title:a,subLabel:r}=e;return l.createElement(n.Z,{className:"pagination-nav__link",to:t},r&&l.createElement("div",{className:"pagination-nav__sublabel"},r),l.createElement("div",{className:"pagination-nav__label"},a))}},5002:(e,t,a)=>{a.d(t,{Z:()=>s});var l=a(7462),n=a(7294),r=a(1548);function i(e){let{toc:t,className:a,linkClassName:l,isChild:r}=e;return t.length?n.createElement("ul",{className:r?void 0:a},t.map((e=>n.createElement("li",{key:e.id},n.createElement("a",{href:`#${e.id}`,className:l??void 0,dangerouslySetInnerHTML:{__html:e.value}}),n.createElement(i,{isChild:!0,toc:e.children,className:a,linkClassName:l}))))):null}function s(e){let{toc:t,className:a="table-of-contents table-of-contents__left-border",linkClassName:s="table-of-contents__link",linkActiveClassName:m,minHeadingLevel:o,maxHeadingLevel:c,...d}=e;const g=(0,r.LU)(),u=o??g.tableOfContents.minHeadingLevel,p=c??g.tableOfContents.maxHeadingLevel,h=(0,r.b9)({toc:t,minHeadingLevel:u,maxHeadingLevel:p}),b=(0,n.useMemo)((()=>{if(s&&m)return{linkClassName:s,linkActiveClassName:m,minHeadingLevel:u,maxHeadingLevel:p}}),[s,m,u,p]);return(0,r.Si)(b),n.createElement(i,(0,l.Z)({toc:h,className:a,linkClassName:s},d))}},1575:(e,t,a)=>{a.d(t,{Z:()=>m});var l=a(7462),n=a(7294),r=a(6010),i=a(5002);const s="tableOfContents_cNA8";function m(e){let{className:t,...a}=e;return n.createElement("div",{className:(0,r.Z)(s,"thin-scrollbar",t)},n.createElement(i.Z,(0,l.Z)({},a,{linkClassName:"table-of-contents__link toc-highlight",linkActiveClassName:"table-of-contents__link--active"})))}},7774:(e,t,a)=>{a.d(t,{Z:()=>o});var l=a(7294),n=a(6010),r=a(9960);const i="tag_hD8n",s="tagRegular_D6E_",m="tagWithCount_i0QQ";function o(e){const{permalink:t,name:a,count:o}=e;return l.createElement(r.Z,{href:t,className:(0,n.Z)(i,o?m:s)},a,o&&l.createElement("span",null,o))}},62:(e,t,a)=>{a.d(t,{Z:()=>o});var l=a(7294),n=a(6010),r=a(5999),i=a(7774);const s="tags_XVD_",m="tag_JSN8";function o(e){let{tags:t}=e;return l.createElement(l.Fragment,null,l.createElement("b",null,l.createElement(r.Z,{id:"theme.tags.tagsListLabel",description:"The label alongside a tag list"},"Tags:")),l.createElement("ul",{className:(0,n.Z)(s,"padding--none","margin-left--sm")},t.map((e=>{let{label:t,permalink:a}=e;return l.createElement("li",{key:a,className:m},l.createElement(i.Z,{name:t,permalink:a}))}))))}}}]);