import {navbar} from "vuepress-theme-hope";

export const zhNavbar = navbar([
    {
        text: "技术文章",
        icon: "build",
        link: "/category/技术日志/",
    },
    {
        text: "其它分类",
        icon: "guide",
        children: [
            {
                text: "Linux",
                icon: "linux",
                link: "/category/Linux/"
            },
        ]
    },
    {
        text: "时间轴",
        icon: "time",
        link: "/timeline",
    },
]);
