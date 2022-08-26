import './css/styles.css';
import debounce from 'lodash.debounce';
import { fetchCountries } from './fetchCountries';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';

const refs = {
    DEBOUNCE_DELAY: 300,
    inputEl: document.querySelector('#search-box'),
    countryList: document.querySelector('.country-list'),
    countryInfo: document.querySelector('.country-info'),
}

const { DEBOUNCE_DELAY, inputEl, countryInfo, countryList } = refs;

inputEl.addEventListener('input', debounce(findCountries, DEBOUNCE_DELAY));


function findCountries() {
    const searchValue = inputEl.value.trim();
    if (searchValue.length > 1) {
        fetchCountries(searchValue).then(data => {
        Loading.standard('Loading...');
        setTimeout(() => {
        if (data.length > 1 && data.length < 10) {
            countryInfo.innerHTML = '';
            countryList.innerHTML = renderListMarkup(data);
            Loading.remove();
        } else {
            if (data.length === 1) {
                countryList.innerHTML = '';
                countryInfo.innerHTML = renderCardMarkup(data);
                Loading.remove();
            } else if (data.status) {
                Loading.remove(1000);
                setTimeout(() => {
                    Notify.failure('Oops, there is no country with that name');
                },1200)
            } else {
                Loading.remove(1000);
                setTimeout(() => {
                    Notify.info('Too many matches found. Please enter a more specific name.');
                },1200)
                countryInfo.innerHTML = '';
                countryList.innerHTML = '';
            }
        }
        },500)
    }).catch(error => {
        console.log(error);
    });
    } else if (searchValue.length === 0) {
        countryInfo.innerHTML = '';
        countryList.innerHTML = '';
    }
}


function renderListMarkup(data) {
    const markup = data.map(({ flag, name }) => {
        return `<li class="country-item"><img class="country-flag" src="${flag}" alt="flag" /><p class="country-name">${name}</p></li>`;
    });
    return markup.join().replaceAll(',','');
}

function renderCardMarkup(data) {
    const lang = data[0].languages.map(item => item.name).join(', ');
    const markup = `
            <li class="country-item">
                <img class="country-cardFlag" src="${data[0].flag}" alt="flag" />
                <h1 class="country-title">${data[0].name}</h1>
            </li>
            <li class="country-item">
                <span class="country-paramName">Capital:</span>
                <span class="country-paramValue">${data[0].capital}</span>
            </li>
            <li class="country-item">
                <span class="country-paramName">Population:</span>
                <span class="country-paramValue">${data[0].population}</span>
            </li>
            <li class="country-item">
                <span class="country-paramName">Languages:</span>
                <span class="country-paramValue">${lang}</span>
            </li>`;
    return markup;
}

//функция fetchCountries должна возвращать только массив данных
//рендер должен происходить в евент листенере