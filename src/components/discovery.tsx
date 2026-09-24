"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Compass, BookOpen, BriefcaseBusiness, Check, Users } from "lucide-react";
import { goals, type Mentor } from "@/data/content";
const icons=[Compass,BookOpen,BriefcaseBusiness];
export function Discovery({mentors}:{mentors:Mentor[]}) {
 const [goal,setGoal]=useState(goals[0]);
 const matches=mentors.filter(m=>m.goal===goal.id);
 return <div><div className="goal-grid" role="group" aria-label="Choose your learning goal">{goals.map((g,i)=>{const Icon=icons[i];return <button key={g.id} className={`goal-card ${goal.id===g.id?"selected":""}`} aria-pressed={goal.id===g.id} onClick={()=>{setGoal(g);window.dispatchEvent(new CustomEvent("impuseviday:conversion",{detail:{action:"goal_selected",goal:g.id}}))}}><span className="goal-card-top"><Icon size={24}/>{goal.id===g.id?<span className="selection-check"><Check size={14}/></span>:<ArrowUpRight size={19}/>}</span><strong>{g.label}</strong><span>{g.description}</span></button>})}</div><div className="goal-result" aria-live="polite" aria-atomic="true"><div className="goal-advice"><p className="eyebrow">YOUR STARTING POINT</p><h3>{goal.title}</h3><ul>{goal.prompts.map(p=><li key={p}><ArrowRight size={16}/>{p}</li>)}</ul></div><div className="directory-status"><span className="icon-box"><Users size={24}/></span><h3>{matches.length ? "Explore matching mentors" : "Good guidance takes the right people."}</h3>{!matches.length && <><p>Mentor profiles are coming. In the meantime, use these questions to shape the conversation you want to have.</p><a className="text-link indigo-link" href="#questions">About mentor availability <ArrowRight size={16}/></a></>}</div></div>{matches.length>0&&<div className="mentor-grid">{matches.map(m=><article className="mentor-card" key={m.id}><Image src={m.image} alt={m.name} width={480} height={360}/><h3>{m.name}</h3><p>{m.role}</p><div className="tags">{m.expertise.map(e=><span key={e}>{e}</span>)}</div>{m.availability&&<p>{m.availability}</p>}<a href={m.profileUrl} data-track="mentor_profile">View {m.name}’s profile <ArrowUpRight size={16}/></a></article>)}</div>}</div>;
}
