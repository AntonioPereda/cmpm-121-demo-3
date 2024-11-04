// todo
import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

//SETUP
const gameName = "Test";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const testButton = document.createElement("button");
testButton.innerHTML = "TestButton";
testButton.style.color = "green";
testButton.style.position = "absolute";
testButton.style.borderRadius = "100%";


testButton.onclick = () => {
  alert("You clicked a button!!!");
};
app.append(testButton);
