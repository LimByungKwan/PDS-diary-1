export const exportTables=['plans','plan_revisions','tasks','execution_records','completion_events','reviews','subtasks'] as const;
export async function readDiaryExport(response:Response){
 const text=await response.text();let data:any;try{data=JSON.parse(text)}catch{throw new Error('자료 대신 다른 페이지가 반환되었습니다. 새로고침 후 다시 내보내 주세요.')}
 if(!response.ok)throw new Error(typeof data.error==='string'?data.error:'전체 자료를 불러오지 못했습니다. 다시 시도해 주세요.');
 if(!response.headers.get('content-type')?.includes('application/json')||data?.schema_version!==2||data?.timezone!=='Asia/Seoul'||data?.time_unit!=='minutes'||!Number.isFinite(Date.parse(data?.exported_at))||exportTables.some(table=>!Array.isArray(data[table])))throw new Error('전체 자료 형식이 맞지 않습니다. 파일을 저장하지 않았습니다. 다시 시도해 주세요.');
 return {text:JSON.stringify(data,null,2)+'\n',data};
}
