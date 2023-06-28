<script lang="ts">
    import Parallax from 'parallax-js'
    import {onMount} from "svelte";
    import Snow from "./Snow.svelte";

    onMount(()=>{
        let scene = document.getElementById('scene');
        let parallaxInstance = new Parallax(scene,{
            relativeInput: true,
            clipRelativeInput: true,
        });
    })
</script>

<div id="scene">
    <img data-depth="0" src="/Asset%2012-01.svg">
    <img data-depth-y="0.001" src="/Asset%2011-01.svg">
    <img data-depth-y="0.003" src="/Asset%2010-01.svg">
    <img data-depth-y="0.006" src="/Asset%209-01.svg">
    <img data-depth-y="0.008" data-depth-x="0.05" src="/Asset%208-01.svg">
    <img data-depth-y="0" src="/Asset%207-01.svg">
    <img data-depth-y="0" data-depth-x="0.02" src="/Asset%206-01.svg">
    <img data-depth-y="0" data-depth-x="0.03" src="/Asset%205-01.svg">
    <img data-depth-y="0.08" data-depth-x="0.02" src="/Asset%204-01.svg">
    <img data-depth-y="0.1" data-depth-x="0.03" src="/Asset%203-01.svg">
    <img data-depth-y="0.15" data-depth-x="0.05" src="/Asset%202-01.svg">
    <Snow/>
    <img class="front" data-depth-y="0.2" data-depth-x="0.15" src="Asset-1-01-01.svg">
</div>

<div class="overlay"></div>

<style>
    #scene{
        position: relative;
        height: 100vh;
        width: 100%;
        left: -2%;

    }
    .overlay{
        width: 100%;
        height: 100vh;
        background-color: rgba(0,0,0,0.25);
        position: absolute;
        top: 0;
        left: 0;
    }
    .front{
        top: 10%;
        width: 105%;
        height: 105vh;
        position: absolute;
        object-fit: cover;
    }
    img{
        width: 105%;
        height: 105vh;
        position: absolute;
        object-fit: cover;

    }
</style>