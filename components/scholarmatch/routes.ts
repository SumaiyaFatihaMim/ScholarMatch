import type {View} from "@/lib/data";
export const VIEW_PATHS:Record<View,string>={
 overview:"/dashboard",
 profile:"/profile",
 explore:"/opportunities",
 recommendations:"/professors",
 outreach:"/outreach",
 tracker:"/applications",
 settings:"/settings",
};
export function pathToView(pathname:string):View{
 if(pathname==="/profile")return "profile";
 if(pathname.startsWith("/opportunities"))return "explore";
 if(pathname.startsWith("/professors"))return "recommendations";
 if(pathname==="/outreach")return "outreach";
 if(pathname==="/applications")return "tracker";
 if(pathname==="/settings")return "settings";
 return "overview";
}
