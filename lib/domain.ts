export const seoulToday=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export type Row=Record<string,any>;
export function aggregate(tasks:Row[],records:Row[],today:string){
 const ids=new Set(tasks.map(t=>t.id)); const r=records.filter(r=>ids.has(r.task_id));
 const done=tasks.filter(t=>t.status==='completed'); const late=tasks.filter(t=>t.status!=='completed'&&t.due_date<today);
 const blocked=new Set(r.filter(r=>r.blocked_reason.trim()).map(r=>r.task_id));
 const estimated=tasks.reduce((s,t)=>s+t.estimated_minutes,0); const actual=Math.round(r.reduce((s,r)=>s+r.actual_minutes,0)*1000)/1000;
 return {planned:tasks.length,completed:done.length,delayed:late.length,blocked:blocked.size,estimated,actual,difference:Math.round((actual-estimated)*1000)/1000};
}
export function basis(metric:string,tasks:Row[],records:Row[],today:string){
 const blocked=new Set(records.filter(r=>r.blocked_reason.trim()).map(r=>r.task_id));
 if(metric==='completed')return tasks.filter(t=>t.status==='completed');
 if(metric==='delayed')return tasks.filter(t=>t.status!=='completed'&&t.due_date<today);
 if(metric==='blocked')return tasks.filter(t=>blocked.has(t.id));
 return tasks;
}

export function formatDuration(minutes:number){
 const seconds=Math.round(Math.abs(minutes)*60);const hours=Math.floor(seconds/3600),mins=Math.floor(seconds%3600/60),secs=seconds%60;
 const parts=[hours?hours+'시간':'',mins?mins+'분':'',secs?secs+'초':''].filter(Boolean);
 return (minutes<0&&seconds>0?'-':'')+(parts.join(' ')||'0분');
}
export function durationToMinutes(hours:unknown,minutes:unknown){
 const h=Number(hours),m=Number(minutes);if(!Number.isInteger(h)||!Number.isInteger(m)||h<0||m<0||m>59||h*60+m>100000)throw new Error('예상 시간을 시간과 분(0~59)으로 확인해 주세요.');return h*60+m;
}
export function cleanTaskTitle(title:string){
 const match=title.match(/^(.+?)(\s*[-–—]\s*|\s+)(20\d{2}[.-])?(\d{1,2})[.-](\d{1,2})(\s*\([월화수목금토일]\))?$/);
 return match&&(match[2].trim()||match[3]||match[6])&&Number(match[4])>=1&&Number(match[4])<=12&&Number(match[5])>=1&&Number(match[5])<=31?match[1].trim():title;
}
export function repeatDates(start:string,end:string,weekdays:number[]){
 const valid=(s:string)=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s+'T00:00:00Z'))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
 if(!valid(start)||!valid(end)||end<start)throw new Error('반복 기간의 시작일과 종료일을 확인해 주세요.');
 if(!Array.isArray(weekdays)||!weekdays.length||weekdays.some(d=>!Number.isInteger(d)||d<0||d>6))throw new Error('반복할 요일을 하나 이상 선택해 주세요.');
 const s=Date.parse(start+'T00:00:00Z'),e=Date.parse(end+'T00:00:00Z');if((e-s)/86400000>=31)throw new Error('반복 기간은 한 번에 최대 31일입니다.');
 const days:string[]=[];for(let time=s;time<=e;time+=86400000){const d=new Date(time);if(weekdays.includes(d.getUTCDay()))days.push(d.toISOString().slice(0,10));}
 if(!days.length)throw new Error('반복 기간에 선택한 요일이 없습니다.');return days;
}
export function splitSubtaskText(text:string){return text.split(/\r?\n|\s+및\s+|[,;]/).map(s=>s.trim()).filter(Boolean).slice(0,30);}
export type PeriodMode='day'|'week'|'month';
function dateNumber(date:string){const time=Date.parse(date+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(time)||new Date(time).toISOString().slice(0,10)!==date)throw new Error('날짜를 확인해 주세요.');return time;}
export function addDays(date:string,days:number){return new Date(dateNumber(date)+days*86400000).toISOString().slice(0,10);}
export function calendarPeriod(mode:PeriodMode,date:string){const d=new Date(dateNumber(date));if(mode==='day')return {start:date,end:date};if(mode==='week'){const start=addDays(date,-((d.getUTCDay()+6)%7));return {start,end:addDays(start,6)}}const start=date.slice(0,7)+'-01';const next=new Date(dateNumber(start));next.setUTCMonth(next.getUTCMonth()+1);return {start,end:addDays(next.toISOString().slice(0,10),-1)};}
export function movePeriod(mode:PeriodMode,date:string,direction:number){if(mode==='day')return addDays(date,direction);if(mode==='week')return addDays(date,7*direction);const d=new Date(dateNumber(date)),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()+direction);const first=d.toISOString().slice(0,10),end=calendarPeriod('month',first).end;return addDays(first,Math.min(day,Number(end.slice(8)))-1);}
export function calendarCells(date:string){const month=calendarPeriod('month',date);const offset=(new Date(dateNumber(month.start)).getUTCDay()+6)%7;const start=addDays(month.start,-offset);const count=Math.ceil((offset+Number(month.end.slice(8)))/7)*7;return Array.from({length:count},(_,i)=>({date:addDays(start,i),inMonth:addDays(start,i).slice(0,7)===date.slice(0,7)}));}
export function periodTasks(tasks:Row[],start:string,end:string){return tasks.filter(t=>!t.deleted_at&&(!start||t.due_date>=start)&&(!end||t.due_date<=end));}
export function periodRecords(records:Row[],tasks:Row[],start:string,end:string){const ids=new Set(tasks.filter(t=>!t.deleted_at).map(t=>t.id));return records.filter(r=>{const date=seoulToday(new Date(r.started_at));return ids.has(r.task_id)&&(!start||date>=start)&&(!end||date<=end)});}
export function nextReviewPeriod(start:string,end:string){const days=(dateNumber(end)-dateNumber(start))/86400000+1;if(days<1)throw new Error('기간을 확인해 주세요.');const next=addDays(end,1);const month=calendarPeriod('month',start);return month.start===start&&month.end===end?calendarPeriod('month',next):{start:next,end:addDays(end,days)};}
export function scheduledTasks(tasks:Row[],start:string,end:string){return tasks.filter(t=>{const begin=t.task_kind==='span'&&t.start_date?t.start_date:t.due_date;return !t.deleted_at&&(!start||t.due_date>=start)&&(!end||begin<=end)});}
export function daysUntil(from:string,to:string){return Math.round((dateNumber(to)-dateNumber(from))/86400000);}
