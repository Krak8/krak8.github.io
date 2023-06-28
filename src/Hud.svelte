<script>

</script>
<svelte:head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins&display=swap');
    </style>
</svelte:head>
<div class="trapezium">
    <a href="https://twitter.com/itskrak8" class="twitter" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-twitter"></i><span class="text">Twitter</span></a>
    <a href="https://github.com/Krak8" class="github" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-github"></i><span class="text">GitHub</span></a>
    <a href="https://www.youtube.com/@Krak8" class="youtube" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-youtube"></i><span class="text">YouTube</span></a>
    <a href="https://www.instagram.com/imkrak8" class="instagram" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-instagram"></i><span class="text">Instagram</span></a>
    <a href="https://www.twitch.tv/imkrak8" class="twitch" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-twitch"></i><span class="text">Twitch</span></a>
    <a href="https://discord.com/invite/ZGCmmgR" class="discord" target="_blank" rel="noopener noreferrer"><i
            class="fab fa-discord"></i><span class="text">Discord</span></a>
</div>


<style>

    @media only screen and (max-width: 500px) {

        .trapezium {
            width: 100%;

        }
    }

    @media only screen and (min-width: 500px) {

        .trapezium {
            width: 60%;

        }
    }

    .trapezium {

        /*height: 10%;*/
        min-height: 50px;
        height: fit-content;
        background-image: linear-gradient(rgba(0, 0, 0, 0.60), rgba(72, 72, 72, 0.28));
        clip-path: polygon(0 0, 100% 0, 90% 100%, 10% 100%);
        display: flex;
        justify-content: center;
        gap: 2vh;
        padding: 3vh 6vh;
        flex-wrap: wrap;
    }
    .fab {
        font-size: 3.2vh;
    }

    .text {
        margin-left: 10px;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
        font-size: 1.7vh;

    }
    a {
        display: flex;
        align-items: center;
        /*color: #FBF6BC;*/
        color: white;
        background-color: rgba(251, 246, 188, 0);
        /*backdrop-filter: blur(9px);*/
        border-radius: 9px;
        /*border-color: #FBF6BC;*/
        border-width: 3px;
        border-style: solid;
        text-decoration: none;
        transition: background-color 0.5s ease,color 0.5s ease;
        height: fit-content;
        padding: 10px 20px;
    }
    a:hover{
        /*background-color: #FBF6BC;*/
        background-color: white;
    }
    .youtube:hover{
        color: #FF0000;
    }
    .twitter:hover {
        color: #1D9BF0;
    }
    .twitch:hover {
        color: #9146FF;
    }
    .discord:hover {
        color: #5865F2;
    }
    .github:hover {
        color: #000000;
    }
    .instagram:hover {
        color: #E1306C;
    }



</style>