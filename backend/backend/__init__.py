import requests, json, uvicorn, openai, sys, time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import HTTPException

#OPENAI_APIKEY = sys.argv[0]
openai.api_key = 'api.key'

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=['*'])

def get_response(prompt, userprompt=""):
    res = str(openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": userprompt}
        ]
    ))

    jres = json.loads(res)

    return str(jres["choices"][0]["message"]["content"])


@app.get("/generate/summary")
async def summary(text:str):
    # time.sleep(5)
    return get_response("In as few words as possible, summarize the following text and get right into the summary.", f"Text: {text}").removeprefix('\"').removesuffix('\"')

@app.get("/generate/questions")
async def questions(text:str, numq:int):
    # time.sleep(5)
    prompt = """
Generate %s multiple choice questions about the following text. Respond using the following JSON schema:\n
[
  {
     'question': 'question'
     'options': [
       'answer 1',
       'answer 2',
       'answer 3',
       'answer 4'
      ],
      'correct': 3
  }
]

Note that 'correct' is an index of 'options' that starts with 0.
Important: MUST Respond ONLY in PURE JSON.
\n

    """ % str(numq)
    uprompt = "Text: %s\n" % text

    # print(prompt)
    # print(uprompt)
    # return [{"question":"What does computer science deal with?","options":["A. Communication skills","B. Design of buildings","C. Theoretical and practical aspects of computers and computation","D. Medical procedures"],"correct":2},{"question":"What are some areas that computer scientists work in?","options":["A. Sociology and anthropology","B. Nutrition and dietetics","C. Artificial intelligence, machine learning, robotics, and cybersecurity","D. Law and politics"],"correct":2},{"question":"What are some key topics in computer science?","options":["A. History and art","B. Psychology and counselling","C. Data structures, algorithms, operating systems, and computer networks","D. Finance and economics"],"correct":2},{"question":"Why did the field of computer science expand after the mid-20th century?","options":["A. Because of an increase in the popularity of traditional hobbies","B. Because of a decrease in the need for computers","C. Because of the invention of the modern computer","D. Because of a decline in scientific research"],"correct":2},{"question":"What must computer scientists do in order to keep up with the field?","options":["A. Nothing; the field never changes","B. Take a break and relax","C. Ignore new research and developments","D. Stay up-to-date with the latest research and developments"],"correct":3}]
    return json.loads(get_response(prompt, uprompt))



uvicorn.run(app, reload=False, host='0.0.0.0')
