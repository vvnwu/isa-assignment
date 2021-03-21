const path = "https://vvnwu-isa.herokuapp.com/COMP4537/labs/individualAssignmentDB/";

const searchParams = new URLSearchParams(window.location.search);
const quiz_id = searchParams.get('selected');
const questions_root = document.getElementById('questions-root');

const answer_key = []
let quiz_len = 0;

async function createQuiz() {
    let response = await fetch(`${path}quiz/${quiz_id}`);
    let quiz = await response.json()
    document.getElementById("quiz-name").innerHTML = quiz.name;

    for (const question of Object.entries(quiz.questions)) {
        quiz_len++;
        questions_root.appendChild(renderQuestion(question[1]));
    }
}

function renderQuestion(question) {
    let node = document.createElement("div")
    node.innerHTML = `
    <h3>Question: ${question.question}</h3>
    <div class="q-${question.question_id}"></div>
    `
    let choice_root = node.getElementsByClassName(`q-${question.question_id}`)[0];
    for (const choice of question.choices) {
        choice_root.appendChild(renderChoice(choice, question.question_id));
    }
    return node;
}

function renderChoice(choice, question_id) {
    let node = document.createElement("div")
    node.className = "form-check"
    node.innerHTML = `
        <input class="form-check-input" id="c-${choice.choice_id}" type="radio" name="q-${question_id}" value="${choice.choice_id}">
        <label class="form-check-label" for="c-${choice.choice_id}">${choice.value}</label>
    `
    if (choice.correct === 1) {
        answer_key.push(choice.choice_id);
    }
    return node;
}

function initSubmit() {
    let button = document.getElementById("submit-button");
    button.addEventListener("click", async (event) => {
        event.preventDefault();
        let form = document.getElementById("quiz-form");
        const formData = new FormData(form);
        const submission = Array.from(formData.entries());
        console.log(submission);
        let score = 0;
        for (let s of submission) {
            if (answer_key.includes(parseInt(s[1]))) {
                score++;
            }
        }
        score = score / quiz_len;
        let scoreNode = document.getElementById("score");
        scoreNode.innerHTML = `
            <h3>Your score was ${score*100}%</h3>
            <div class="input-group">
                <input id="Your Name" type="text" class="form-control name" placeholder="Your Name">
                <div class="input-group-append">
                <button id="new-quiz-button" class="btn btn-outline-secondary name-btn" type="button">Save Score</button>
                </div>
            </div>
        `
        let name = scoreNode.getElementsByClassName("name")[0]
        let namebtn = scoreNode.getElementsByClassName("name-btn")[0]

        namebtn.addEventListener("click", async (event) => {
            let scorejson = {
                "name": name.value,
                "score": score
            }
            const response = await fetch(`${path}quiz/${quiz_id}/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scorejson)
            });
            const quiz_scores = await response.json();
            let scoreboard = document.getElementById("scoreboard")
            console.log(quiz_scores);
            scoreboard.innerHTML=`
                <h3>Scoreboard</h3>
                <table class="table table-dark">
                    <thead>
                        <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Score</th>
                        </tr>
                    </thead>
                    <tbody>
                    </tbody>
                </table>
            `
            let sb_scores = scoreboard.getElementsByTagName("tbody")[0];
            for(let s of quiz_scores){
                sb_scores.innerHTML+=`
                <tr>
                    <td>${s.Name}</td>
                    <td>${s.Score*100}%</td>
                </tr>
                `
            }

        })
    })
}

initSubmit();
createQuiz();