// import bot from './assets/bot.svg'
// import user from './assets/user.svg'
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
            };
        }
    }
    
  });


const handleSubmit = async (e) => {
    e.preventDefault()
    
    const data = new FormData(form)


    if (myCheckbox.checked) {
        let content=''
        if(fileUpload.files.length == 0){
        
            alert("No file provided, please add you txt files")
            form.reset()
        }else{
            const selectedFiles = fileUpload.files;
            
            // for (let i = 0; i < selectedFiles.length; i++) {
            //     const fileReader = new FileReader();
            //     fileReader.readAsText(selectedFiles[i]);
            //     fileReader.onload = () => {
            //       const fileContents = fileReader.result;
            //       const start = fileContents.substring(0,200)
            //       const end = fileContents.substring(fileContents.length-200)
            //       content =`${start}\n\n\n ..... \n\n\n .....\n\n\n${end}`
            //       const uniqueId = generateUniqueId()
            //       chatContainer.innerHTML += chatStripe(true, content, uniqueId)
            //     };
            //   }
            
            chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
            const uniqueId = generateUniqueId()
            chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

            // to focus scroll to the bottom 
            chatContainer.scrollTop = chatContainer.scrollHeight;

            // specific message div 
            const messageDiv = document.getElementById(uniqueId)

            // messageDiv.innerHTML = "..."
            loader(messageDiv)
        }
        
    
    console.log("The checkbox is checked");
    
    } else {
    console.log("The checkbox is not checked");
    

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

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
            prompt: data.get('prompt')
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