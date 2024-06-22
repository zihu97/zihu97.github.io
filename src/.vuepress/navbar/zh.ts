import {navbar} from "vuepress-theme-hope";

export const zhNavbar = navbar([
    {
        text: "技术文章",
        icon: "build",
        link: "/category/tech/",
    },
    {
        text: "其它分类",
        icon: "guide",
        children: [
            {
                text: "工具合集",
                icon: "box",
                link: "/category/tool/"
            },
        ]
    },
    {
        text: "时间轴",
        icon: "time",
        link: "/timeline",
    },
]);
