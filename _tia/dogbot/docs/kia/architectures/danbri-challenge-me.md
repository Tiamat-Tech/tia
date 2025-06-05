To revisit 2025-01-14

I'm setting myself a challenge, and I've like you to hold me to it. Before my next birthday, I must create, find or otherwise obtain a model/architecture/_system_ & whatever runtime & interfaces necessary, that will behave much like a GPT but support efficient continuous learning such that it can run on not-fancy desktop hardware, ie. a small plastic model brain. If I do not succeed, my forfeit will be buying you a life-size plastic model brain.

Two-part motivation:

1. Earthquake Prediction
   Although I don't think it's strictly necessary for a useful system, my gut says it'd make it much, much better. Inputs will be multimodal data : seismo mechanical/acoustic + nature radio + planetary motions + climate + ... That all goes in Deep Learning System Q (hey, nice name!) and out comes a prediction. From the research I've seen, it seems likely that a static pre-trained model(s) could do a fair job (I've still not found access to the paper about experiments on an area in China where they used seismo + EM data, but they got very good results from very old-school ML kit). A pattern-matching, cause-effect system to do this is easily within reach. In principle it's very similar to the next-frame-of-a-video prediction task, but with a lot more dimensions. Get data acquisition & training pipelines sorted, tweak existing code, add appropriate I/O, UI, job done. Hah! I know even that's unlikely to be easy in practice, but most of the path is well-trodden.

The input/output for that will be multi-dimensional time series. But it seems like an inherently limited, N-1 dimensional approach. The cause-effect that can be pre-trained is stuck with the data it's trained on. No doubt a lot of influencial features would be there, but pre-training can only capture superficial ones, because the geo++ system being modelled is changing over time. There will be patterns (over different time scales) that are not captured by the pre-trained model. A simple potential gain from continuous learning is that the system will be more able to say things about how the geo system is _now_, analogous to ChatGPT being stuck at 2021. But I reckon this will make deeper (and hence more accurate) modelling available. I don't think this automatically means any significant increase in computational complexity, although the physical motions/pressures etc will be extremely complex & chaotic, but it's physics on a Newtonian scale, features in the data - if pulled out into a spreadsheet - could be treated as effectively differentiable functions that can be approximated. So internal to a neural net, it's nothing new.

2. Other Stuff
   Right now I'm still preoccupied with the personal knowledge management side of things. Get LLMs in there. But whatever you call the Artificial Personal Assistant thing, one thing that's really desirable is for it to be able to adapt over time - new tasks, new data sources/information, new ways of doing things. The pre-trained model alone, no matter how smart & useful _at this point in time_, has knowledge & skills that will become outmoded.

Ok, so _how_ to do this? I have neither the knowledge nor experience to dive into the internals of LLMs etc just yet. But I do know about divide & conquer in problem solving. So rather than trying to think in terms of getting a single component to get adaptive, I think the community of agents approach is the way to go. Individually they can be really stupid in LLM terms, but in having them interact, being very loosely-coupled in a shared environment (XMPP MUC playground), I reckon that's a way I can figure some of this out. And longer term, a federation of agents seems a pretty good way of Leading the Web to its Full Potential.

So. Plastic brain, innit.

Cheers,
Danny.
