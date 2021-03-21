const db = require('../modules/quizdb');

async function init() {
    const queries = [{
            key: 'Quiz',
            sql: `CREATE TABLE IF NOT EXISTS Quiz(
                QuizID INT AUTO_INCREMENT PRIMARY KEY, 
                Name VARCHAR(255))`
        },
        {
            key: 'Question',
            sql: `CREATE TABLE IF NOT EXISTS Question(
                QuestionID INT AUTO_INCREMENT PRIMARY KEY, 
                QuizID INT NOT NULL,
                Question VARCHAR(255),
                FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID) ON DELETE CASCADE)`
        },
        {
            key: 'Choice',
            sql: `CREATE TABLE IF NOT EXISTS Choice(
                ChoiceID INT AUTO_INCREMENT PRIMARY KEY,
                QuestionID INT NOT NULL, 
                Choice VARCHAR(255), 
                Correct BOOLEAN,
                FOREIGN KEY (QuestionID) REFERENCES Question(QuestionID) ON DELETE CASCADE)`
        },
        {
            key: 'QuizScore',
            sql: `CREATE TABLE IF NOT EXISTS QuizScore(
                id INT AUTO_INCREMENT PRIMARY KEY, 
                QuizID INT NOT NULL,
                Score FLOAT,
                Name VARCHAR(255),
                FOREIGN KEY (QuizID) REFERENCES Quiz(QuizID) ON DELETE CASCADE)`
        }
    ]
    try {
        for (const table of queries) {
            let result = await db.query(table.sql);
            console.log(`${table.key} Table initialized`);
        }
    } catch (error) {
        throw error;
    }

}
init();

const express = require('express');
const router = new express.Router();

// get all quizzes
router.get('/quizzes', async (req, res) => {
    try {
        let sql = "SELECT * FROM Quiz";
        let result = await db.query(sql);
        let quizzes = []
        result.forEach(element => {
            quizzes.push(element);
        });

        console.log(JSON.stringify(quizzes));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(quizzes));
        return res.end();
    } catch (error) {
        throw error;
    }
})

//create quiz
router.post('/quiz', async (req, res) => {
    const data = req.body;
    if (!data.hasOwnProperty('name')) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.end(`400 Bad Request \n${req.body}`);
    } else {
        try {
            const sql = `INSERT INTO Quiz(name) values ('${data.name}');`;
            let result = await db.query(sql);
            let res_data = {
                "QuizID": result.insertId
            }
            console.log('1 record inserted');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.write(JSON.stringify(res_data));
            return res.end();
        } catch (error) {
            throw error;
        }
    }
})

//get quiz
router.get('/quiz/:quiz_id', async (req, res) => {
    try {
        let sql = `SELECT * FROM Quiz
                LEFT JOIN Question ON Quiz.QuizID = Question.QuizID
                LEFT JOIN Choice ON Question.QuestionID = Choice.QuestionID
                WHERE Quiz.QuizID = ${req.params.quiz_id}`;
        let result = await db.query(sql);
        console.log(JSON.stringify(result));
        let res_data = {
            "quiz_id": req.params.quiz_id,
            "name": result[0].Name,
            "questions": {}
        };
        for (const row of result) {
            if (!row.QuestionID)
                continue;
            if (!res_data.questions.hasOwnProperty(row.QuestionID)) {
                res_data.questions[row.QuestionID] = {
                    "question": row.Question,
                    "question_id": row.QuestionID,
                    "choices": [{
                        "choice_id": row.ChoiceID,
                        "value": row.Choice,
                        "correct": row.Correct
                    }]
                }
            } else {
                res_data.questions[row.QuestionID].choices.push({
                    "choice_id": row.ChoiceID,
                    "value": row.Choice,
                    "correct": row.Correct
                });
            }
        }
        console.log(JSON.stringify(result));
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(res_data));
        return res.end();
    } catch (error) {
        throw error;
    }
})

//create question
router.post('/quiz/:quiz_id', async (req, res) => {
    try {
        console.log(req.body);
        const sql = `INSERT INTO Question(QuizID, Question) values (${req.params.quiz_id}, '${req.body.question}');`;
        let question_result = await db.query(sql);

        let res_data = {
            "question": req.body.question,
            "question_id": question_result.insertId,
            "choices": []
        }

        for (const choice of Object.entries(req.body.choices)) {
            let value = choice[1];
            const correct = (value.hasOwnProperty("correct") && value.correct === true) ? "TRUE" : "FALSE";
            const choice_sql = `INSERT INTO Choice(QuestionID, Choice, Correct) values (${question_result.insertId}, '${value.value}', ${correct});`;
            let choice_result = await db.query(choice_sql);
            res_data.choices.push({
                "choice_id": choice_result.insertId,
                "value": value.value,
                "correct": (correct === "TRUE") ? 1 : 0,
            })
        }

        console.log('Question Created');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(res_data));
        return res.end()
    } catch (error) {
        throw error;
    }
})


//create choice
router.post('/choice', async (req, res) => {
    try {
        console.log(req.body);
        const sql = `INSERT INTO Choice(QuestionID, Choice, Correct) values (${req.body.question_id}, '${req.body.value}', FALSE);`;
        let choice_result = await db.query(sql);

        let res_data = {
            "choice_id": choice_result.insertId,
            "value": req.body.value,
            "correct": false
        }

        console.log('Choice Created');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(res_data));
        return res.end()
    } catch (error) {
        throw error;
    }
})

//update choice
router.put('/choice/:choice_id', async (req, res) => {
    try {
        const sql = `UPDATE Choice
        SET Choice = '${req.body.value}', Correct= ${(req.body.correct===true) ? "TRUE" : "FALSE"}
        WHERE ChoiceID=${req.params.choice_id};`;
        let result = await db.query(sql);
        console.log('1 choice updated');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.end();
    } catch (error) {
        throw error;
    }
})

//update question
router.put('/question/:question_id', async (req, res) => {
    try {
        const sql = `UPDATE Question
        SET Question = '${req.body.question}'
        WHERE QuestionID=${req.params.question_id};`;
        let result = await db.query(sql);

        let res_data = {
            "question": req.body.question,
            "question_id": req.params.question_id,
            "choices": []
        }

        for (const choice of Object.entries(req.body.choices)) {
            let value = choice[1];
            const correct = (value.hasOwnProperty("correct") && value.correct === true) ? "TRUE" : "FALSE";
            const choice_sql = `UPDATE Choice
                                SET Choice = '${value.value}', Correct= ${correct}
                                WHERE ChoiceID=${value.id};`;
            let choice_result = await db.query(choice_sql);
            res_data.choices.push({
                "choice_id": value.id,
                "value": value.value,
                "correct": (correct === "TRUE") ? 1 : 0,
            })
        }

        console.log('1 question updated');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(res_data));
        return res.end();
    } catch (error) {
        throw error;
    }
})

//delete question
router.delete('/question/:question_id', async (req, res) => {
    try {
        const sql = `DELETE FROM Question WHERE QuestionID=${req.params.question_id};`;
        let result = await db.query(sql);
        console.log('1 question deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.end();
    } catch (error) {
        throw error;
    }
})



//delete choice
router.delete('/choice/:choice_id', async (req, res) => {
    try {
        const sql = `DELETE FROM Choice WHERE ChoiceID=${req.params.choice_id};`;
        let result = await db.query(sql);
        console.log('1 choice deleted');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.end();
    } catch (error) {
        throw error;
    }
})

//create score
router.post('/quiz/:quiz_id/score', async (req, res) => {
    try {
        console.log(req.body);
        let sql = `INSERT INTO QuizScore(QuizID, Score, Name) values (${req.params.quiz_id}, ${req.body.score}, '${req.body.name}');`;
        let ins_result = await db.query(sql);

        sql = `SELECT * FROM QuizScore WHERE QuizScore.QuizID = ${req.params.quiz_id}`;
        let sel_result = await db.query(sql);
        console.log(JSON.stringify(sel_result));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.write(JSON.stringify(sel_result));
        return res.end();
    } catch (error) {
        throw error;
    }
})

module.exports = router;