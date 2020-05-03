const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

export default[

  {
    //the part after '#' in the url (so-called fragment):
    hash:"welcome",
    ///id of the target html element:
    target:"router-view",
    //the function that returns content to be rendered to the target html element:
    getTemplate:(targetElm) =>
      document.getElementById(targetElm).innerHTML = document.getElementById("template-welcome").innerHTML

  },
  {
    hash:"articles",
    target:"router-view",
    getTemplate: fetchAndDisplayArticles
  },
  {
    hash:"article",
    target:"router-view",
    getTemplate: fetchAndDisplayArticleDetail
  },
  {
    hash:"artEdit",
    target:"router-view",
    getTemplate: editArticle
  },
  {
    hash:"output",
    target:"router-view",
    getTemplate:output
  },

  {
    hash:"input",
    target:"router-view",
    getTemplate:(targetElm) =>
      document.getElementById(targetElm).innerHTML = document.getElementById("template-input").innerHTML
  }

];



function output(targetElm) {

  let opinions=[];

  if(localStorage.myInfo){
    opinions=JSON.parse(localStorage.myInfo);
  }

  function opinion2html(opinion){
    //in the case of Mustache, we must prepare data beforehand:
    opinion.createdDate=(new Date(opinion.created)).toDateString();
    //get the template:
    const template = document.getElementById("MyInfo").innerHTML;

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
  const opinionsElm=document.getElementById(targetElm);
  if(localStorage.myInfo){
    opinions=JSON.parse(localStorage.myInfo);
  }

  opinionsElm.innerHTML=opinionArray2html(opinions);
}

function fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash){

  const offset=Number(offsetFromHash);
  const totalCount=Number(totalCountFromHash);

  let urlQuery = "";

  if (offset && totalCount){
    urlQuery=`?offset=${offset}&max=${articlesPerPage}`;
  }else{
    urlQuery=`?max=${articlesPerPage}`;
  }

  const url = `${urlBase}/article${urlQuery}`;

  fetch(url)
    .then(response =>{
      if(response.ok){
        return response.json();
      }else{ //if we get server error
        return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
      }
    })
    .then(responseJSON => {
      addArtDetailLink2ResponseJson(responseJSON);
      document.getElementById(targetElm).innerHTML =
        Mustache.render(
          document.getElementById("template-articles").innerHTML,
          responseJSON
        );
    })
    .catch (error => { ////here we process all the failed promises
      const errMsgObj = {errMessage:error};
      document.getElementById(targetElm).innerHTML =
        Mustache.render(
          document.getElementById("template-articles-error").innerHTML,
          errMsgObj
        );
    });
}

function addArtDetailLink2ResponseJson(responseJSON){
  responseJSON.articles =
    responseJSON.articles.map(
      article =>(
        {
          ...article,
          detailLink:`#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`
        }
      )
    );
}

function fetchAndDisplayArticleDetail(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
  fetchAndProcessArticle(...arguments,false);
}

function fetchAndProcessArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash,forEdit) {
  const url = `${urlBase}/article/${artIdFromHash}`;

  fetch(url)
    .then(response =>{
      if(response.ok){
        return response.json();
      }else{ //if we get server error
        return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
      }
    })
    .then(responseJSON => {


      if(forEdit){
        responseJSON.formTitle="Article Edit";
        responseJSON.formSubmitCall =
          `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
        responseJSON.submitBtTitle="Save article";
        responseJSON.urlBase=urlBase;

        responseJSON.backLink=`#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

        document.getElementById(targetElm).innerHTML =
          Mustache.render(
            document.getElementById("template-article-form").innerHTML,
            responseJSON
          );
      }else{

        responseJSON.backLink=`#articles/${offsetFromHash}/${totalCountFromHash}`;
        responseJSON.editLink=`#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
        responseJSON.deleteLink=`#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

        document.getElementById(targetElm).innerHTML =
          Mustache.render(
            document.getElementById("template-article").innerHTML,
            responseJSON
          );
      }

    })
    .catch (error => { ////here we process all the failed promises
      const errMsgObj = {errMessage:error};
      document.getElementById(targetElm).innerHTML =
        Mustache.render(
          document.getElementById("template-articles-error").innerHTML,
          errMsgObj
        );
    });

}

function editArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
  fetchAndProcessArticle(...arguments,true);
}
