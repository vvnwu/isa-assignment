const path = "https://vvnwu-isa.herokuapp.com/COMP4537/labs/individualAssignmentDB/";


const quiz_root = document.getElementById('quiz-list');

fetch(path+'quizzes')
    .then(response => response.json())
    .then((quiz_json) => {
        console.log(quiz_json)
        if(quiz_json.length>0){
            quiz_json.forEach(quiz => {
                console.log(quiz)
                let quiz_node = document.createElement("li");
                quiz_node.className="list-group-item";
                
                let quiz_link = document.createElement("a");
                quiz_link.innerHTML = quiz.Name;
                quiz_link.title = quiz.Name;
                quiz_link.href = `./admin-quiz.html?selected=${quiz.QuizID}`;
        
                quiz_node.appendChild(quiz_link);
                quiz_root.appendChild(quiz_node);
            });
        }
    });

const new_quiz_button = document.getElementById('new-quiz-button');
const new_quiz_input = document.getElementById('new-quiz-input');

new_quiz_button.addEventListener("click", async()=>{
    if(new_quiz_input.value){
        const data = {"name": new_quiz_input.value}
        const response = await fetch(path+'quiz',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        console.log(response);
        let quiz = await response.json();
        if(response.status ===200){
            window.location.replace(`./admin-quiz.html?selected=${quiz.QuizID}`);
        }
    }
});
