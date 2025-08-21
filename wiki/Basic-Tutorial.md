# Basic Tutorial: Create Your First Webpage 🎨

Let's create a simple webpage together using DevPad!

## Project: Personal Introduction Card

We'll create a card that shows:
- Your name
- A brief bio
- Your favorite color

## Step 1: HTML Structure 📝

Copy this code into the HTML panel:

```html
<div class="card">
  <h1>Your Name</h1>
  <p class="bio">Web Developer in Training</p>
  <p class="favorite-color">My favorite color is blue!</p>
  <button id="changeColor">Change Color</button>
</div>
```

## Step 2: Adding Style 🎨

Copy this code into the CSS panel:

```css
.card {
  width: 300px;
  padding: 20px;
  margin: 20px auto;
  text-align: center;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  background-color: white;
}

h1 {
  color: #333;
  margin-bottom: 10px;
}

.bio {
  color: #666;
  font-style: italic;
}

.favorite-color {
  font-weight: bold;
  color: blue;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}
```

## Step 3: Adding Interactivity ⚡

Copy this code into the JavaScript panel:

```javascript
const colors = ['blue', 'red', 'green', 'purple', 'orange'];
let currentColor = 0;

document.getElementById('changeColor').onclick = function() {
  currentColor = (currentColor + 1) % colors.length;
  const newColor = colors[currentColor];
  
  document.querySelector('.favorite-color').style.color = newColor;
  document.querySelector('.favorite-color').textContent = 
    `My favorite color is ${newColor}!`;
};
```

## Try It Out! 🎉

Now you should see:
1. A nicely styled card
2. Your name and bio
3. A button that changes the favorite color

## Customize It! 🎨

Try changing:
1. Your name in the HTML
2. The card width in CSS
3. The colors list in JavaScript

## What You Learned 📚

- HTML: Structure and elements
- CSS: Styling and layout
- JavaScript: Interactivity and events
- How they work together

## Next Steps 🚀

1. Try changing more styles
2. Add more buttons
3. Add your own features
4. Check out [Tips and Tricks](./Tips-and-Tricks)

Need help? Check our [FAQ](./FAQ) or ask in [Issues](../../issues)!
