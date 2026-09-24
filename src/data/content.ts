export type Mentor = { id:string; name:string; role:string; image:string; expertise:string[]; goal:string; profileUrl:string; availability?:string };
export type Testimonial = {name:string;context:string;quote:string};
// Populate only with approved, factual profiles and consented learner stories.
export const mentors: Mentor[] = [];
export const testimonials: Testimonial[] = [];
export const goals = [
 {id:"direction",label:"Find my direction",description:"Get clearer on what to do next.",title:"Start with the question behind your goal.",prompts:["What would you like to be different?","What options are you considering?","What is one decision you want help with?"]},
 {id:"skills",label:"Build a skill",description:"Turn curiosity into understanding.",title:"Choose something you want to put into practice.",prompts:["What would you like to be able to do?","What have you already tried?","What small project could help you practise?"]},
 {id:"career",label:"Explore my career",description:"Think through your next chapter.",title:"Give your next career decision some direction.",prompts:["What kind of work interests you?","Which strengths would you like to use?","What do you want to understand about that path?"]},
];
export const faqs = [
 {question:"What is ImpulseVidya?",answer:"ImpulseVidya is an education and mentorship platform being built around purposeful learning and human guidance. This page introduces the approach and helps you think through your next learning goal."},
 {question:"Where should I start?",answer:"Choose a goal in the guidance section. You’ll find a few questions to help you clarify what you want to learn and the kind of guidance to look for. You don’t need an account to explore this page."},
 {question:"Can I book a mentor session now?",answer:"Mentor profiles and booking are not available yet. Session formats, availability, prices and cancellation terms will be published alongside the offering when it is ready."},
 {question:"How can I become a mentor?",answer:"Mentor applications are not open yet. Application details and participation requirements will be published here when the programme is ready."},
];
