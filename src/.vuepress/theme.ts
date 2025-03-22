import {hopeTheme} from "vuepress-theme-hope";
import {zhNavbar} from "./navbar";
import {zhSidebar} from "./sidebar";

export default hopeTheme({
    hostname: "https://zihu97.github.io",

    author: {
        name: "紫狐",
        url: "https://zihu97.github.io/",
    },

    iconAssets: "iconfont",

    logo: "/logo.jpg",

    docsDir: "docs",
    editLink: false,
    blog: {
        medias: {
            GitHub: "https://github.com/zihu97",
            Email: "mailto:m13706579109@163.com",
        },
    },

    locales: {
        "/": {
            navbar: zhNavbar,

            sidebar: zhSidebar,

            footer: "哈哈哈哈",

            displayFooter: false,

            blog: {
                description: "一个内核爱好者",
                intro: "/intro.html",
            },
        
            // page meta
            metaLocales: {
                editLink: "在 GitHub 上编辑此页",
            },
        },
    },

    plugins: {
        comment: {
            provider: "Giscus",
            repo: "zihu97/zihu97.github.io",
            repoId: "R_kgDOMMvIMA",
            category: "Announcements",
            categoryId: "DIC_kwDOMMvIMM4CgSKR",
            inputPosition: "top",
            lazyLoading: true,
        },
        readingTime: {
            wordPerMinute: 300
        },
        feed: {
            rss: true,
        },
        blog: true,
        // all features are enabled for demo, only preserve features you need here
        mdEnhance: {
            align: true,
            attrs: true,
            chart: true,
            codetabs: true,
            demo: true,
            echarts: true,
            figure: true,
            flowchart: true,
            gfm: true,
            imgLazyload: true,
            imgSize: true,
            include: true,
            katex: true,
            mark: true,
            mermaid: true,
            presentation: {
                plugins: ["highlight", "math", "search", "notes", "zoom"],
            },
            stylize: [
                {
                    matcher: "Recommended",
                    replacer: ({tag}) => {
                        if (tag === "em")
                            return {
                                tag: "Badge",
                                attrs: {type: "tip"},
                                content: "Recommended",
                            };
                    },
                },
            ],
            sub: true,
            sup: true,
            tabs: true,
            vPre: true,
            vuePlayground: true,
        },
    },
});
