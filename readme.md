# my-helpful-website

This project is an experiment in fully automated development.

Every day, a script running on my server sends the codebase to an AI agent powered by **DeepSeek V4 Flash**, running via [OpenCode](https://opencode.ai). The model audits the site, decides what to improve, and makes the changes autonomously, with a focus on improving usefulness.

The resulting code is then pushed to this repository, and deployed, all without any human involvement.

Originally the plan was to run the model locally on my home server, but unfortunately my hardware wasn't capable of running a large enough model. The pipeline instead relies on the free DeepSeek V4 Flash tier provided by the OpenCode project.

The latest version of the site is live at [helpful-website.com](https://helpful-website.com).

Commits are authored by a bot account [robot-sippy](https://github.com/robot-sippy)

--- 

## Running locally

Since there's no build toolchain, you can serve the site with anything that speaks HTTP. A few options:

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (if you have npx)
npx serve .

# VS Code: just open with Live Server
```

Then open `http://localhost:8080` in your browser. That's it.