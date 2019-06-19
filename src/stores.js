import { writable } from 'svelte/store';

function createLang() {
	const { subscribe, set, update } = writable('en');

	return {
		subscribe,
		ua: () => set('ua'),
		ru: () => set('ru'),
		en: () => set('en'),
		reset: () => set('en')
	};
}

function createCurrPage(){
	const { subscribe, set, update } = writable('home');

	return{
		subscribe,
		home:(e)=>{
			e.preventDefault();
			set('home')},
		about:(e)=>{
			e.preventDefault();
			set('about')},
		projects:(e)=>{
			e.preventDefault();
			set('projects')},
		contact:(e)=>{
			e.preventDefault();
			set('contact')}
	}
}

export const texts = writable({
	menu:{
		ru:{
			logo:'YaOvdiy',
			choosenLang:'Русский',
			home:'Главная',
			about:'Обо мне',
			projects:'Проекты',
			contact:'Контакты'
		},
		en:{
			logo:'YaOvdiy',
			choosenLang:'English',
			home:'Home',
			about:'About',
			projects:'Projects',
			contact:'Contact'
		},
		ua:{
			logo:'YaOvdiy',
			choosenLang:'Українська',
			home:'Головна',
			about:'Про мене',
			projects:'Проекти',
			contact:'Контакти'
		}
	},
	home:{
		welcom:{
			en:["Hi there!", 
				"Thanks for visit my resume, sort of:)",
				"Here I would show, most if my skills",
				"First of all",
				"This site written using SVELTE",
				"That's a first time I using it",
				"Look around, maybe you will like it",
				"Have a nice day!"
			],
			ua:[
				"Доброго дня!",
				"Дякую що завітали до мого резюме",
				"Тут я покажу більшість свої вмінь",
				"Спершу",
				"Цей сайт зроблений з використанням SVELTE",
				"Це перший мій проект на ньому",
				"Погляньте що тут є, можливо Вам щось сподобається",
				"Всього Вам на кращего!"
			],
			ru:[
				"Добрый день!",
				"Спасибо что посетили мое резюме",
				"Тут я покажу большенство своих умений",
				"Сначала",
				"Этот сайт был сделан с использованием SVELTE",
				"Это мой первый проект на нем",
				"Осмотритесь тут, может найдете что то интересно для Вас",
				"Хорошего Вам дня!"
			]
		},
		subText:{
			en:"I'm not a disigner, so don't be judging :)",
			ua:'Я не дизайнер, тому не судь строго :)',
			ru:'Я не дизайнер, поэтому не судите строго :)'
		},
		works:{
			en:'My works',
			ua:'Мої роботи',
			ru:'Мои работы'
		},
		resume:{
			en:'My resume',
			ua:'Моє резюме',
			ru:'Мое резюме',
		}
	},
	about:{
		text:{
			en:`<p>
					Okey, little information about me.
				</p>
				<p>
					My name is Yaroslav. I worked in Obliksoft company on position of the junior front-end.
					<br>
					I worked there for 10 month
					<br>
					I started as there as junior specialist, and supported already exsiting projects written on JavaScript
					and REST API.
					<br>
					At the end of my time there I was creating my own apps for Bitrix24 platform using already React/Redux 
					and Webpack for compiling projects
				</p>`,
			ua:`<p>
					Ну що, трохи інформації про мене.
				</p>
				<p>
					Моє ім'я Ярослав. Я працював в компанії Обліксофт на позиції  junior front-end.
					<br>
					Я пропрацював там 10 місяців
					<br>
					Я починав як молодший спеціаліст та підтримував вже існуючі проекти написанні на JavaScript та 
					з використанням REST API.
					<br>
					Під кінець своєї роботи в компанії я вже розробляв свої застосунки для платформи Bitrix24 використовуючи
					React/Redux та Webpack для компіляції проектів
				</p>`,
			ru:`<p>
					Okey, little information about me.
				</p>
				<p>
					My name is Yaroslav. I worked in Obliksoft company on position of the junior front-end.
					<br>
					I worked there for 10 month
					<br>
					I started as there as junior specialist, and supported already exsiting projects written on JavaScript
					and REST API.
					<br>
					At the end of my time there I was creating my own apps for Bitrix platform using already React/Redux 
					and Webpack for compiling projects
				</p>`,
		},
		cv:{
			ru:'Скачать резюме',
			en:'Download my CV',
			ua:'Завантажити резюме',
		},
		projects:{
			ru:'Посмотрите мои работы',
			ua:'Подивіться мої роботи',
			en:'Look for my work',
		}


	}
})

export const lang = createLang();

export const currPage = createCurrPage();