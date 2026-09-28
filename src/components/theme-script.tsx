"use client";

const script = `(function(){try{var t=localStorage.getItem("impulsevidya-theme");if(t!=="light"&&t!=="dark")t=["dashboard","login","signup","forgot-password","reset-password"].indexOf(location.pathname.split("/")[1])>-1?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}})()`;

export function ThemeScript() {
    return (
        <script
            type={typeof window === "undefined" ? undefined : "text/plain"}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: script }}
        />
    );
}
