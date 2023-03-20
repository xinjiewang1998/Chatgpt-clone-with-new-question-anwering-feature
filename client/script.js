// import bot from './assets/bot.svg'
// import user from './assets/user.svg'
// import * as FileSaver from 'file-saver';
bot ='./assets/bot.svg'
user='./assets/user.svg'
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const myCheckbox = document.getElementById("myCheckbox");
const fileUpload = document.getElementById("fileUpload");

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}
let result;
fileUpload.addEventListener('change', (event) => {
    if (myCheckbox.checked){
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            const fileReader = new FileReader();
            fileReader.readAsText(files[i]);
            fileReader.onload = () => {
              const fileContents = fileReader.result;
              const start = fileContents.substring(0,200)
              const end = fileContents.substring(fileContents.length-200)
              content =`${start}\n\n\n ..... \n\n\n .....\n\n\n${end}`
              const uniqueId = generateUniqueId()
              chatContainer.innerHTML += chatStripe(true, content, uniqueId)
              const url = 'http://localhost:8000/context/';
              const data = `${fileContents}`;
            //   console.log(JSON.stringify({ text: data }))
                fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({text:data})
                })
                .then(response => response.json())
                .catch(error => console.log(error));

            };
        }
    }
    
  });


const handleSubmit = async (e) => {
    e.preventDefault()
    
    const form_data = new FormData(form)


    if (myCheckbox.checked) {
        if(fileUpload.files.length == 0){
        
            alert("No file provided, please add you txt files")
            form.reset()
        }else{
            chatContainer.innerHTML += chatStripe(false, form_data.get('prompt'))
            const uniqueId = generateUniqueId()
            chatContainer.innerHTML += chatStripe(true, " ", uniqueId)
            // to focus scroll to the bottom 
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // specific message div 
            const messageDiv = document.getElementById(uniqueId)
            loader(messageDiv)
            
            // messageDiv.innerHTML = "..."
            messageDiv.innerHTML = " "
            const response = await fetch('http://localhost:8000/generate/', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt: form_data.get('prompt')
            })
            
            }) 
            clearInterval(loadInterval)
            if (response.ok) {
                const data = await response.json();
                const parsedData = data.result.trim() // trims any trailing spaces/'\n' 
                console.log(parsedData)
                typeText(messageDiv, parsedData)
            } else {
                const err = await response.text()
        
                messageDiv.innerHTML = "Something went wrong"
                alert(err)
            }
        }
        
    
    console.log("The checkbox is checked");
    
    } else {
    console.log("The checkbox is not checked");
    

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, form_data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: form_data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})