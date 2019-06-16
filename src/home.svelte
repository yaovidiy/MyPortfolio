<style>
.home{
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 10%;
}
#typing{
    text-align: center;
}
</style>

<script>
    import { texts, lang } from './stores.js';
    import { onMount } from 'svelte';

    onMount(()=>{
        let currText = 0, textPos = 0;
        let mainText = '';

        function typing(text, pos){
            console.log("get here");
            let getText = $texts.home.welcom[$lang][text];
            let allTexts = $texts.home.welcom[$lang];
            let input = document.querySelector("#typing");
            if ( getText.length > pos ){
                input.innerHTML += getText[pos];
                pos++;
                setTimeout(() => {
                    typing(text, pos);                    
                }, 50);
            }
            else if ( (allTexts.length - 1) > text ){
                pos = 0;
                text++;
                setTimeout(() => {
                    input.innerHTML = '';
                    typing(text,pos);                    
                }, 1000);
            }
            else{
                input.innerHTML = `${$texts.home.welcom[$lang][text]}`
                console.log("all printed", text, pos, allTexts, getText);
            }
        }
        typing(currText, textPos);

    });

</script>

<section class="container home">
    <div class="row">
        <div class="col-12 d-flex flex-column align-items-center">
            <h1 id="typing"></h1>
            <span class="small-text">{$texts.home.subText[$lang]}</span>
        </div>
        <div class="col-12 d-flex flex-column align-items-center">
            <button class="btn btn-outline-primary mb-2 mt-2">{$texts.home.works[$lang]}</button>
            <button class="btn btn-primary">{$texts.home.resume[$lang]}</button>
        </div>
    </div>
</section>