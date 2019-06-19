<style>
.main-menu{
    display: flex;
    position: relative;
    justify-content: space-between;
    align-items: center;
}
.logo{
    text-transform: uppercase;
    font-size: 30px;
    font-family: "Inconsolata",Arial,sans-serif;
}
.toogle-menu{
    position: absolute;
    left: 85%;
    top:-15%;
    color: #000;
    text-decoration: none;
    cursor: pointer;
    font-size: 40px;
    z-index: 10000;
}
.menu-mobile{ 
    display: none;
}
.menu-desktop{
    display: block;
}
.menu-mobile-background{
    display: none;
    flex-direction: column;
    justify-content: center;
    position: absolute;
    align-items: center;
    top: 0;
    left: 0;
    width: 100%;
    background-color: #000;
    z-index: 999;
}
.menu-mobile-items{
    list-style: none;
    padding-left: 0;
}
.menu-mobile-item{
    padding: 10px;
}
.menu-mobile-item a{
    font-size: 25px;
    text-decoration: none;
    cursor: pointer;
    color: #fff;
    opacity: 0.8;
}
.menu-mobile-item a:focus{
    opacity: 1;
}
.accordion{
    height: 0;
    overflow: hidden;
}
.accordion-list{
    list-style: none;
    padding-left: 0; 
}
.open-lang{
    cursor: pointer;
}
.accordion-item a{
    font-size: 25px;
    text-decoration: none;
    cursor: pointer;
    color: #fff;
    opacity: 0.8;
}
.accordion-item a:focus{
    opacity: 1;
}

.menu-desktop-items{
    list-style: none;
}
.menu-desktop-item{
    display: inline;
    padding: 20px;
}
.menu-desktop-item a{
    color: #000;
    opacity: 0.8;
    text-decoration: none;
    outline: none;
}
.menu-desktop-item a:hover{
    opacity: 1;
    border-bottom: 3px solid orange;
}
.active-desktop{
    opacity: 1;
    border-bottom: 3px solid orange;
}
.active-mobile{
    opacity: 1;
}
.dropdown{
    position: relative;
}
.dropdown-content{
    position: absolute;
    display: none;
    top: 50px;
    left: -50px;
    z-index: 1000;
}
.open-lang_lg{
    color:#000;
}
@media screen and (max-width: 768px){
    .menu-mobile{
        display: block;
    }
    .menu-desktop{
        display: none;
    }
}


</style>

<script>
import { lang, texts, currPage } from './stores.js';

let openedMenu = false;
let openedLang = false;


function toogleMenu(){
    let menu = document.querySelector(".menu-mobile-background");
    let toogle = document.querySelector(".toogle-menu");
    if (!openedMenu){
        menu.style.display = 'flex';
        toogle.style.color = '#fff';
    }
    else{
        menu.style.display = 'none';
        toogle.style.color = '#000';
    }
    openedMenu = !openedMenu;
}

console.log($currPage);

function toogleLang (elem,attr,g=false){
    let accordion = document.querySelector(`.${elem}`);
    if ( !openedLang ){
        accordion.style[attr] = (attr==='display')?'block':'auto';
    }
    else{
        accordion.style[attr] = (attr==='display')?'none':'0px';
    }
    openedLang = !openedLang;

}

</script>


<nav class="main-menu container">
    <div class="logo">
        YaOvdiy
    </div>
    <div class="menu-mobile">
        <a on:click={toogleMenu} href="#" class="toogle-menu">
            {#if openedMenu}
                <i class="fas fa-times"></i>
            {:else }
                <i class="fas fa-bars"></i>
            {/if}
            
        </a>
        <div class="menu-mobile-background">
            <ul class="menu-mobile-items">
                <li class="menu-mobile-item" class:active-mobile="{$currPage === 'home'}">
                    <a on:click={currPage.home} href="#">{$texts.menu[$lang].home}</a>
                </li>
                <li class="menu-mobile-item" class:active-mobile="{$currPage === 'about'}">
                    <a on:click={currPage.about} href="#">{$texts.menu[$lang].about}</a>
                </li>
                <li class="menu-mobile-item" class:active-mobile="{$currPage === 'projects'}">
                    <a on:click={currPage.projects} href="#">{$texts.menu[$lang].projects}</a>
                </li>
                <li class="menu-mobile-item" class:active-mobile="{$currPage === 'contact'}">
                    <a on:click={currPage.contact} href="#">{$texts.menu[$lang].contact}</a>
                </li>
                <li class="menu-mobile-item" >
                    <a href="#">{$texts.menu[$lang].choosenLang} 
                    <span on:click={toogleLang.bind(null,'accordion','height')} class="open-lang">
                        {#if openedLang}
                            <i class="fas fa-angle-up"></i>
                        {:else}
                            <i class="fas fa-angle-down"></i>
                        {/if}
                    </span> </a>
                        <div class="accordion">
                            <ul class="accordion-list">
                                <li class="accordion-item">
                                    <a on:click={lang.en} href="#">English</a>
                                </li>
                                <li class="accordion-item">
                                    <a on:click={lang.ua} href="#">Українська</a>
                                </li>
                                <li class="accordion-item">
                                    <a on:click={lang.ru} href="#">Русский</a>
                                </li>
                            </ul>
                        </div>
                </li>
            </ul>
        </div>
    </div>
    <div class="menu-desktop">
        <ul class="menu-desktop-items">
            <li class="menu-desktop-item" >
                <a class:active-desktop="{$currPage === 'home'}" 
                on:click={currPage.home} href="#">{$texts.menu[$lang].home}</a>
            </li>
            <li class="menu-desktop-item" >
                <a class:active-desktop="{$currPage === 'about'}" 
                on:click={currPage.about} href="#">{$texts.menu[$lang].about}</a>
            </li>
            <li class="menu-desktop-item" >
                <a  class:active-desktop="{$currPage === 'projects'}" 
                on:click={currPage.projects} href="#">{$texts.menu[$lang].projects}</a>
            </li>
            <li class="menu-desktop-item" >
                <a class:active-desktop="{$currPage === 'contact'}" 
                on:click={currPage.contact} href="#">{$texts.menu[$lang].contact}</a>
            </li>
            <li class="menu-desktop-item dropdown">
                <a href="#">{$texts.menu[$lang].choosenLang}
                    <span on:click={toogleLang.bind(null,'dropdown-content','display')} class="open-lang_lg">
                        {#if openedLang}
                            <i class="fas fa-angle-up"></i>
                        {:else}
                            <i class="fas fa-angle-down"></i>
                        {/if}
                    </span>
                </a>
                <div class="dropdown-content">
                    <ul class="dropdown-list">
                        <li class="dropdown-item">
                            <a on:click={lang.en} href="#">English</a>
                        </li>
                        <li class="dropdown-item">
                            <a on:click={lang.ua} href="#">Українська</a>
                        </li>
                        <li class="dropdown-item">
                            <a on:click={lang.ru} href="#">Русский</a>
                        </li>                                                
                    </ul>
                </div>
            </li>                                                
        </ul>
    </div>
</nav>