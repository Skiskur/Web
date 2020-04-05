let Frm=document.getElementById("input");
Frm.addEventListener
("submit",processOpnFrmData);

let opinions=[];

if(localStorage.myInfo){
  opinions=JSON.parse(localStorage.myInfo);
}

console.log(opinions);

function processOpnFrmData(event){
  //1.prevent normal event (form sending) processing
  event.preventDefault();

  //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
  const nopName = document.getElementById("text").value.trim();
  const nopEmail = document.getElementById("email").value.trim();
  const nopUrl = document.getElementById("url").value.trim();
  const nopArea = document.getElementById("textarea").value.trim();

  //3. Verify the data
  if(nopName=="" || nopEmail=="" || nopArea==""){
    window.alert("Please, enter Name, Email and Text Area");
    return;
  }

  //3. Add the data to the array opinions and local storage
  const newOpinion =
    {
      name: nopName,
      email: nopEmail,
      Url: nopUrl,
      Text: nopArea,
      created: new Date()
    };

  console.log("New info:\n "+JSON.stringify(newOpinion));

  opinions.push(newOpinion);

  localStorage.myInfo = JSON.stringify(opinions);


  //4. Notify the user
  console.log(opinions);

}



function opinion2html(opinion){

  //in the case of Mustache, we must prepare data beforehand:
  opinion.createdDate=(new Date(opinion.created)).toDateString();

  //get the template:
  const template = document.getElementById("MyInfo").innerHTML;
  //use the Mustache:
  const htmlWOp = Mustache.render(template,opinion);

  //delete the createdDate item as we created it only for the template rendering:
  delete(opinion.createdDate);

  //return the rendered HTML:
  return htmlWOp;


}

function opinionArray2html(sourceData){
  return sourceData.reduce((htmlWithOpinions,opn) => htmlWithOpinions+ opinion2html(opn),"");  //"" is the initial value of htmlWithOpinions in reduce. If we do not use it, the first member of sourceData will not be processed correctly
}

opinions=[];
const opinionsElm=document.getElementById("opinionsContainer");
if(localStorage.myInfo){
  opinions=JSON.parse(localStorage.myInfo);
}
opinionsElm.innerHTML=opinionArray2html(opinions);




