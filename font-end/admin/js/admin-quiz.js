const path = "https://vvnwu-isa.herokuapp.com/COMP4537/labs/individualAssignmentDB/";

let searchParams = new URLSearchParams(window.location.search);
const quiz_id = searchParams.get('selected');
const edit_question_root = document.getElementById('questions-root');

const new_question_button = document.getElementById('new-question-button');
const new_question_form = document.getElementById('new-question-form');
const new_choice_button = document.getElementById('new-choice-button');
const new_choice_root = document.getElementById('new-question-choices');

class NewQuestion {
    constructor(new_question_button, new_question_form, new_choice_button, new_choice_root, quiz) {
        this.new_question_button = new_question_button;
        this.new_question_form = new_question_form;
        this.new_choice_button = new_choice_button;
        this.new_choice_root = new_choice_root;
        this.count = 0;
        this.quiz = quiz;

        this.new_question_button.addEventListener("click", async (event) => {
            event.preventDefault();

            const formData = new FormData(new_question_form);
            const new_question_data = Array.from(formData.entries());

            console.log(new_question_data)
            let new_question_json = {
                "question": "",
                "choices": {}
            }
            new_question_data.forEach(([key, value]) => {
                if (key === "question") {
                    new_question_json[key] = value;
                } else if (key === "new-question-checked") {
                    if (new_question_json["choices"][value])
                        new_question_json["choices"][value]["correct"] = true;
                    else
                        new_question_json["choices"][value] = {
                            "correct": true
                        };
                } else {
                    if (new_question_json["choices"][key])
                        new_question_json["choices"][key]["value"] = value;
                    else
                        new_question_json["choices"][key] = {
                            "value": value
                        };
                }
            })

            console.log(new_question_json)
            const response = await fetch(`${path}quiz/${quiz_id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(new_question_json)
            });
            let question = await response.json();
            console.log(question);
            if (response.status === 200) {
                this.new_question_form.reset();
                this.new_choice_root.innerHTML = "";
                this.count = 0;
                this.quiz.addQuestion(question);
            }
        });

        this.new_choice_button.addEventListener("click", (event) => {
            event.preventDefault();
            this.count++;
            let new_choice = document.createElement('div');
            new_choice.className = "form-group " //row col-sm-10
            new_choice.innerHTML = `
                <div class="input-group row col-sm-10">
                    <div class="input-group-prepend">
                        <div class="input-group-text">
                        <input type="radio" name="new-question-checked" value="new-question-${this.count}">
                        </div>
                    </div>
                    <input type="text" class="form-control" id="new-question-${this.count}" name="new-question-${this.count}"">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Delete</button>
                    </div>
                </div>
            `
            let button = new_choice.getElementsByTagName('button')[0];
            button.addEventListener("click", (event)=>{
                event.preventDefault();
                new_choice.remove();
            })
            new_choice_root.appendChild(new_choice);
        });
    }
}
class Quiz {
    constructor(quiz_id) {
        fetch(`${path}quiz/${quiz_id}`)
            .then(response => response.json())
            .then((quiz_json) => {
                this.name = quiz_json.name;
                this.question_id = quiz_json.question_id;
                this.questions = []
                if(Object.keys(quiz_json.questions).length>0){
                    for (const q of Object.entries(quiz_json.questions)) {
                        this.questions.push(new Question(q[1], this));
                    }
                }
                
                this.render()
            });
    }
    render() {
        document.getElementById("quiz-name").innerHTML = this.name;
        for(let question of this.questions){
            question.render(edit_question_root);
        }
    }
    addQuestion(question){
        let newQuestion = new Question(question, this);
        this.questions.push(newQuestion);
        newQuestion.render(edit_question_root);
    }
    removeQuestion(question_id){
        this.questions = this.questions.filter(function(el) { return el.question_id != question_id; });
    }
}

class Question {
    constructor(q_json, parent) {
        this.parent = parent;
        this.question = q_json.question;
        this.question_id = q_json.question_id;
        this.choices = []
        for (const c of q_json.choices) {
            this.choices.push(new Choice(c, this));
        }
    }
    render(parent_node) {
        this.parent_node = parent_node;
        this.node = document.createElement('form');
        this.node.innerHTML = `
            <div class="form-group input-group row col-sm-10">
                <input type="text" class="form-control" value="${this.question}" name="question-${this.question_id}"/>
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Update</button>
                    <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Delete</button>
                </div>
            </div>
            <div class="choices-${this.question_id}"></div>
            <div class="form-group input-group row col-sm-10">
                <input type="text" class="form-control" placeholder="Add Choice" id="question-${this.question_id}-new-choice"/>
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Add Choice</button>
                </div>
            </div>
        `
        this.choice_root = this.node.getElementsByClassName(`choices-${this.question_id}`)[0];
        for(const c of this.choices){
            c.render(this.choice_root);
        }
        
        let buttonlen= this.node.getElementsByTagName('button').length;
        let update_button = this.node.getElementsByTagName('button')[0];
        update_button.addEventListener("click", (event)=>{
            event.preventDefault();
            this.update();
        })

        let delete_button = this.node.getElementsByTagName('button')[1];
        delete_button.addEventListener("click", (event)=>{
            event.preventDefault();
            this.delete();
        })

        let add_button = this.node.getElementsByTagName('button')[buttonlen-1];
        add_button.addEventListener("click", (event)=>{
            event.preventDefault();
            let input = document.getElementById(`question-${this.question_id}-new-choice`);
            this.addChoice(input);
        })

        parent_node.appendChild(this.node);
    }

    async addChoice(input){
        const new_choice_json = {
            "question_id": this.question_id,
            "value": input.value,
        }
        const response = await fetch(`${path}choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(new_choice_json)
        });

        let choice = await response.json();
        console.log(choice);
        if (response.status === 200) {
            const newChoice = new Choice(choice, this);
            this.choices.push(newChoice);
            newChoice.render(this.choice_root);
            input.value = "";
        }

    }

    removeChoice(choice_id){
        this.choices = this.choices.filter(function(el) { return el.choice_id != choice_id; });
    }
    async update() {
        const formData = new FormData(this.node);
        const question_data = Array.from(formData.entries());
        console.log(question_data)

        let question_json = {
            "question": "",
            "choices": {}
        }
        question_data.forEach(([key, value]) => {
            if (key === `question-${this.question_id}`) {
                question_json["question"] = value;
            } else if (key === `checked-${this.question_id}`) {
                if (question_json["choices"][value])
                    question_json["choices"][value]["correct"] = true;
                else
                    question_json["choices"][value] = {
                        "correct": true
                    };
            } else {
                let id = key.split("-")[1];
                if (question_json["choices"][key]){
                    question_json["choices"][key]["value"] = value;
                    question_json["choices"][key]["id"] = id;
                }else{
                    question_json["choices"][key] = {
                        "value": value,
                        "id":id
                    };
                }
                    
            }
        })

        console.log(question_json)

        const response = await fetch(`${path}question/${this.question_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(question_json)
        });

        let q_json = await response.json();
        console.log(q_json);
        if (response.status === 200) {
            this.question = question_json.question;
            this.choices = []
            for (const c of q_json.choices) {
                this.choices.push(new Choice(c, this));
            }
            this.node.remove()
            this.render(this.parent_node);
        }
    }
    async delete() {
        const response = await fetch(`${path}question/${this.question_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(response.status === 200){
            this.parent.removeQuestion(this.question_id);
            this.node.remove();
        }
    }
}

class Choice {
    constructor(c_json, parent) {
        this.parent = parent;
        this.choice_id = c_json.choice_id;
        this.value = c_json.value;
        this.correct = c_json.correct;

        this.node = document.createElement('div');
        this.node.className = "form-group"
        this.node.innerHTML = `
            <div class="input-group row col-sm-10">
                <div class="input-group-prepend">
                    <div class="input-group-text">
                    <input class="checked-${this.choice_id}" type="radio" name="checked-${this.parent.question_id}" value="c-${this.choice_id}" ${(this.correct?"checked":"")}>
                    </div>
                </div>
                <input type="text" class="c-${this.choice_id} form-control" name="c-${this.choice_id}" value="${this.value}">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Delete</button>
                </div>
            </div>
        `

        let delete_button = this.node.getElementsByTagName('button')[0];
        delete_button.addEventListener("click", (event)=>{
            event.preventDefault();
            this.delete();
        })
    }
    render(parent_node) {
        this.node = document.createElement('div');
        this.node.className = "form-group"
        this.node.innerHTML = `
            <div class="input-group row col-sm-10">
                <div class="input-group-prepend">
                    <div class="input-group-text">
                    <input class="checked-${this.choice_id}" type="radio" name="checked-${this.parent.question_id}" value="c-${this.choice_id}" ${(this.correct?"checked":"")}>
                    </div>
                </div>
                <input type="text" class="c-${this.choice_id} form-control" name="c-${this.choice_id}" value="${this.value}">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" onsubmit="return false" type="button">Delete</button>
                </div>
            </div>
        `

        let delete_button = this.node.getElementsByTagName('button')[0];
        delete_button.addEventListener("click", (event)=>{
            event.preventDefault();
            this.delete();
        })
        parent_node.appendChild(this.node);
    }
    async delete() {
        const response = await fetch(`${path}choice/${this.choice_id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if(response.status === 200){
            this.parent.removeChoice(this.choice_id);
            this.node.remove();
        }
    }
}


let quiz = new Quiz(quiz_id);
let nq = new NewQuestion(new_question_button, new_question_form, new_choice_button, new_choice_root, quiz)