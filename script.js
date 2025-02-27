const btnSearch = document.querySelector("#btnSearch");
const btnLocation = document.querySelector("#btnLocation");
const imgFlag = document.querySelector("#neighbors");

btnSearch.addEventListener("click", () => {
  let text = document.querySelector("#txtSearch").value;
  getCountry(text);
  getWeather(text);
});

imgFlag.addEventListener("click", async (e) => {
  if (e.target.tagName === "IMG") {
    fadeOut(document.querySelector("#details"));
    fadeOut(document.querySelector("#neighbors"));

    await new Promise((resolve) => setTimeout(resolve, 300));

    let parentItem = e.target.parentElement;
    let neighborName = parentItem.querySelector("h5").textContent;

    await getCountry(neighborName);
    await getWeather(neighborName);

    // 4) Yeni veriler geldikten sonra fade-in
    fadeIn(document.querySelector("#details"));
    fadeIn(document.querySelector("#neighbors"));
  }
});

btnLocation.addEventListener("click", () => {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }
});

function onError(err) {
  console.log(err);
}

async function onSuccess(position) {
  let lat = position.coords.latitude;
  let lang = position.coords.longitude;

  const api_key = "8d27df4af149405ca7cb5d953e9fd86d";
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lang}&key=${api_key}`;

  const response = await fetch(url);
  const data = await response.json();

  const country = data.results[0].components.country;
  document.querySelector("#txtSearch").value = country;
  document.querySelector("#btnSearch").click();
}

async function getCountry(country) {
  try {
    const response = await fetch("https://restcountries.com/v3.1/name/" + country);
    if (!response.ok) throw new Error("Ülke bulunamadı.");
    const data = await response.json();

    renderCountry(data[0]);

    const borders = data[0].borders;
    if (!borders) {
      throw new Error("Komşu ülke bulunamadı.");
    }
    const response2 = await fetch(
      "https://restcountries.com/v3.1/alpha?codes=" + borders.toString()
    );
    const neighbors = await response2.json();

    renderNeigbors(neighbors);
  } catch (err) {
    renderError(err);
  }
}

const newUrl = 'https://api.openweathermap.org/data/2.5/'
const newapi_key = '5a342235b32428319b96a27f54ad8b5b'
function getWeather(country) {
  let query = `${newUrl}weather?q=${country}&appid=${newapi_key}&units=metric&lang=tr`
  fetch(query)
  .then(weather => {
    return weather.json()
  })
  .then(displayResult)
}

const displayResult = (result) => {
  let city = document.querySelector('.city');
  city.innerText = `${result.name}`

  let temp = document.querySelector('.temp');
  temp.innerText = `${Math.round(result.main.temp)}°C`
  
  let desc = document.querySelector('.desc');
  desc.innerText = result.weather[0].description;

  let wind = document.querySelector('.wind');
  wind.innerText = `${result.wind.speed}`

  let humidity = document.querySelector('.humidity')
  humidity.innerText = `${Math.round(result.main.humidity)}%`

  let icon = document.querySelector('.icon');
  icon.src = `https://openweathermap.org/img/wn/${result.weather[0].icon}@2x.png`;


  console.log(result);
}

function fadeOut(element) {
  element.style.opacity = 0;
}

function fadeIn(element) {
  element.style.opacity = 1;
}

function renderCountry(data) {
  document.querySelector("#country-details").innerHTML = "";

  let html = `
    <div class="col-4">
      <img src="${data.flags.png}" alt="" class="img-fluid" />
    </div>
    <div class="col-8">
      <h3 class="card-title">${data.name.common}</h3>
      <hr />
      <div class="row">
        <div class="col-4">Nüfus:</div>
        <div class="col-8">${(data.population / 1000000).toFixed(1)} Milyon</div>
      </div>
      <div class="row">
        <div class="col-4">Dil:</div>
        <div class="col-8">${Object.values(data.languages)}</div>
      </div>
      <div class="row">
        <div class="col-4">Başkent:</div>
        <div class="col-8">${data.capital[0]}</div>
      </div>
      <div class="row">
        <div class="col-4">Para Birimi:</div>
        <div class="col-8">
          ${Object.values(data.currencies)[0].name} 
          ${Object.values(data.currencies)[0].symbol}
        </div>
      </div>
    </div>
  `;

  document.querySelector("#country-details").innerHTML = html;
  document.querySelector("#details").style.opacity = 1;
}

function renderNeigbors(data) {
  let indicators = "";
  let slides = "";

  data.forEach((country, index) => {
    indicators += `
      <button
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide-to="${index}"
        ${index === 0 ? 'class="active" aria-current="true"' : ""}
        aria-label="Slide ${index + 1}"
      ></button>
    `;

    slides += `
      <div class="carousel-item ${index === 0 ? "active" : ""}">
        <img src="${country.flags.png}" class="d-block w-100 img-fluid" alt="${country.name.common} bayrağı" />
        <div class="carousel-caption d-none d-md-block">
          <h5>${country.name.common}</h5>
        </div>
      </div>
    `;
  });

  let html = `
    <div id="carouselExampleCaptions" class="carousel slide">
      <div class="carousel-indicators">
        ${indicators}
      </div>
      <div class="carousel-inner">
        ${slides}
      </div>
      <button
        class="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
      >
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button
        class="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
      >
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  `;

  document.querySelector("#neighbors").innerHTML = html;
  document.querySelector("#neighbors").style.opacity = 1;
}

function renderError(err) {
  const html = `
    <div class="alert alert-danger">
      ${err.message}
    </div>
  `;
  setTimeout(function () {
    document.querySelector("#errors").innerHTML = "";
  }, 3000);
  document.querySelector("#errors").innerHTML = html;
}
