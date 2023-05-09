import axios from "axios";
import { useEffect, useState } from "react";
import './EvalQuestions.css'
import { useLocation, useNavigate } from "react-router";


const EvalQuestions = () => {
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);
  const [mcqQuestions, setMCQQuestions] = useState([]);
  const [paragraphQuestions, setParagraphQuestions] = useState([]);
  // const [result, setResult] = useState([])
  let mcqScore = 0;

  const [textScore,setTextScore] = useState(0)
  const [codeScore,setCodeScore] = useState(0)

  

  const location = useLocation();
  const email = location.state.email;


  useEffect(() => {
    axios.get(`http://localhost:701/getTestResults/${email}`)
      .then(response => {
        setTestResults(response.data)
      })
      .catch(error => console.error(error));
  }, []);

  useEffect(() => {
    if (testResults.length > 0) {
      console.log('This is the testResults : ',testResults)
      const selectedAnswersIds = testResults.flatMap(result => Object.keys(result.selectedAnswers));
      console.log('Selected answers Ids : ',selectedAnswersIds)
      const providedAnswersIds = testResults.flatMap(result => Object.keys(result.providedAnswers))
      console.log('This is provided answers ids ',providedAnswersIds)
      axios.all([
        axios.get('http://localhost:701/getMCQQuestions',{
          params : {
            ids: selectedAnswersIds.join(",")
          }
        }),
        axios.get('http://localhost:701/getParagraphQuestions',{
          params : {
            ids: providedAnswersIds.join(",")
          }
        })
      ])
      .then(axios.spread((mcqQuestionsResponse, paragraphQuestionsResponse) => {
        setMCQQuestions(mcqQuestionsResponse.data)
        setParagraphQuestions(paragraphQuestionsResponse.data)
        console.log(paragraphQuestionsResponse.data)
      }))
      .catch(error => console.error(error));
    }
  }, [testResults]);
  
  const handleParagraphQuestion = (event) => {
    const dropdownMenu = event.target;
    const selectedMark = dropdownMenu.value;
    const questionId = dropdownMenu.id.split("-")[1];
    const question = paragraphQuestions.find((q) => q._id === questionId);
    
    // Disable the dropdown menu
    dropdownMenu.disabled = true;
    
    if (question.subtype === "code") {
      // Update the code score
      setCodeScore((codeScore) => codeScore + parseInt(selectedMark));
    } else if (question.subtype === "text") {
      // Update the text score
      setTextScore((textScore) => textScore + parseInt(selectedMark));
    }
  };
  
  return (
    <div>
      <h1>Candidate : {email}</h1>
      <hr />
      <br />
      <h2>Evaluate MCQQuestions</h2>
      <br />
        <ol>
        {mcqQuestions.map((question) => (
          <li key={question._id}>
            <div className="card">
              <div className="card-body">
                <h3>{question.question}</h3>
                <p>
                  correct answer : {question.correct_choice}
                </p>
                <label>
                  <input
                    type="radio"
                    name={question._id}
                    value={1}
                    checked={testResults[0].selectedAnswers[question._id] == 1}
                  />
                  {question.choice1}
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name={question._id}
                    value={2}
                    checked={testResults[0].selectedAnswers[question._id] == 2}

                  />
                  {question.choice2}
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name={question._id}
                    value={3}
                    checked={testResults[0].selectedAnswers[question._id] == 3}
                  />
                  {question.choice3}
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name={question._id}
                    value={4}
                    checked={testResults[0].selectedAnswers[question._id] == 4}

                  />
                  {question.choice4}
                </label>
                <br />
                <br />
                <span id={`symbol-${question._id}`} className="symbol">
                {testResults[0].selectedAnswers[question._id] == question.correct_choice ? 
                (
                  <>&#10004; Correct</>
                )
                : (
                  <>&#10008; Wrong</>
                )
                }
              </span>
              </div>
            </div>
            <br />
          </li>
          
        ))}
        {mcqQuestions.map((question)=>{
          testResults[0].selectedAnswers[question._id] == question.correct_choice ? mcqScore++ : console.log('')
        })}
      </ol>  
      <hr />
      <h3>MCQ Score : {mcqScore}</h3>
      <hr />
      <h1>Evaluate Paragraph Questions</h1>
      <br />
      <ol>
        {paragraphQuestions.map((question) => (
          <li>
            <div key={question._id} className="paragraph-question">
              <h3>{question.question} (Type : {question.subtype})</h3>
              <div className="answer-wrapper">
                <div className="correct-answer">
                  <p>Correct Answer:</p>
                  <textarea name="correct-answer" value={question.answer} rows="15" cols="30" readOnly />
                </div>
                <div className="given-answer">
                  <p>Given Answer:</p>
                  <textarea name="given-answer" value={testResults[0].providedAnswers[question._id]} rows="15" cols="30" readOnly />
                </div>
                <br />
              </div>
              <br />
              <p>Select marks zero to five : </p>
              <select name="marks" id={`marks-${question._id}`}
              onChange={handleParagraphQuestion}
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              <br />
            </div>
            <br />
          </li>

        ))}
      </ol>
      <div>
      <button type="submit"
        id={`evaluate-all`}
        onClick={() => {
          console.log('mcqscore:', mcqScore);
          console.log('code score:', codeScore);
          console.log('text score:', textScore);
          console.log('total marks', mcqScore+textScore+codeScore)
          
          // Navigate to the summary page
          navigate('/summary', {state : { 
            mcqScore,
            textScore,
            codeScore,
            totalScore: mcqScore + textScore + codeScore
          }});
        }}
>
  Evaluate
</button>

      </div>
    </div>
  );
};


export default EvalQuestions;