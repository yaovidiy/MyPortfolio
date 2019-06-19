<style>
    .photo img{
        width: 100%;
        overflow: hidden;
        border-radius: 50%;
    }
</style>
<script>
import { texts, lang } from './stores.js';

</script>
<section id="about" class="container mt-5">
    <div class="row justify-content-center align-items-center">
        <div class="col-sm-3 col-md-3 col-xs-12">
            <div class="photo">
                <img src="newPhoto.jpg" alt="MyPhoto" />
            </div>
        </div>
        <div class="col-sm-9 col-md-9 col-xs-12 mt-2">
            <div class="abput-text">
                {@html $texts.about.text[$lang]}
            </div>
            <div class="col-12">
                <button class="btn btn-outline-primary mr-2 col-sm-12 col-md-4">{$texts.about.cv[$lang]}</button>
                <button class="btn btn-primary col-sm-12 col-md-4">{$texts.about.projects[$lang]}</button>
            </div>
        </div>
    </div>
</section>