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
                quiz_link.href = `./student-quiz.html?selected=${quiz.QuizID}`;
        
                quiz_node.appendChild(quiz_link);
                quiz_root.appendChild(quiz_node);
            });
        }
    });
