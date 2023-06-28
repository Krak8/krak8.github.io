<script lang="ts" xmlns="http://www.w3.org/1999/html">
    import Background from "../Background.svelte";
    import Hud from "../Hud.svelte";
    import {onMount} from "svelte";
    onMount(()=>{
        // console.log("HIDE")
        // document.getElementById("loader").style.animationPlayState = "running";
        if (document.readyState === "complete") {
            hideLoader();
        }
        document.onreadystatechange = () => {
            if (document.readyState === "complete") {
                hideLoader();
            }
        };
    })

    function hideLoader() {
        console.log("HIDE")
        document.getElementById("loader").style.animationPlayState = "running";
    }

</script>
<svelte:head>
    <style>
        @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css");
        @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,600&display=swap');
    </style>
</svelte:head>
<div id="container">

    <div id="loader"></div>
    <Background/>
    <div class="header">
        <Hud/>
        <img class="logo" src="/logo.webp">
        <span class="text">"I don't make it, I Krak8."</span>
    </div>

</div>

<style>
    :global(html,body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
        'Open Sans', 'Helvetica Neue', sans-serif;
        /*min-height: 100vh;*/
        overflow: hidden;
    }
    .header {
        z-index: 2;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5vh;
    }

    .text{
        font-family: 'EB Garamond', serif;
        font-size: 64px;
        white-space: break-spaces;
        text-align: center;
        color: white;
    }

    .logo{
        border-radius: 50%;
        width: 9%;
        min-width: 100px;
        height: auto;
        object-fit: cover;

    }



    @keyframes load {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0;
            visibility: hidden;
        }

    }

    #container {
        position: relative;
    }

    #loader {
        position: fixed;
        height: 100vh;
        width: 100%;
        background-color: #1B1B3A;
        z-index: 3;
        animation-name: load;
        animation-timing-function: linear;
        animation-duration: 2s;
        animation-play-state: paused;
        animation-iteration-count: 1;
        animation-fill-mode: forwards;
    }

</style>