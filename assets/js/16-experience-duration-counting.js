
(function(){
  const dynamicDurations=Array.from(document.querySelectorAll('[data-duration-start]'));
  if(!dynamicDurations.length)return;

  function getDateParts(timeZone){
    const formatter=new Intl.DateTimeFormat('en-CA',{
      timeZone,
      year:'numeric',
      month:'2-digit',
      day:'2-digit'
    });
    const parts=formatter.formatToParts(new Date()).reduce((result,part)=>{
      if(part.type!=='literal')result[part.type]=part.value;
      return result;
    },{});
    return {
      year:Number(parts.year),
      month:Number(parts.month),
      day:Number(parts.day)
    };
  }

  function formatDuration(months){
    const years=Math.max(0,Math.floor(months/12));
    const remainder=Math.max(0,months%12);
    return `${years} ${years===1?'year':'years'} ${remainder} ${remainder===1?'month':'months'}`;
  }

  function updateDuration(element){
    const [year,month,day]=element.dataset.durationStart.split('-').map(Number);
    if(!year||!month||!day)return;
    const now=getDateParts(element.dataset.durationTimezone||undefined);
    let totalMonths=(now.year-year)*12+(now.month-month);
    if(now.day<day)totalMonths-=1;
    element.textContent=formatDuration(totalMonths);
  }

  function updateAll(){
    dynamicDurations.forEach(updateDuration);
  }

  updateAll();
  window.setInterval(updateAll,60*60*1000);
})();
