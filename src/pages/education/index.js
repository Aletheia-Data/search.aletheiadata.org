import React from 'react';

import MiniSearch from 'minisearch';
import numeral from 'numeral';

import '../../styles/search.css';

export default function Home() {

  const documents = [
    {
      id: 1,
      title: 'Moby Dick',
      text: 'Call me Ishmael. Some years ago...',
      category: 'fiction'
    },
    {
      id: 2,
      title: 'Zen and the Art of Motorcycle Maintenance',
      text: 'I can see by my watch...',
      category: 'fiction'
    },
    {
      id: 3,
      title: 'Neuromancer',
      text: 'The sky above the port was...',
      category: 'fiction'
    },
    {
      id: 4,
      title: 'Zen and the Art of Archery',
      text: 'At first sight it must seem...',
      category: 'non-fiction'
    },
    // ...and more
  ]
  
  let miniSearch = new MiniSearch({
    fields: ['title', 'text'], // fields to index for full-text search
    storeFields: ['title', 'category'] // fields to return with search results
  })
  
  // Index all documents
  miniSearch.addAll(documents)
  
  // Search with default options
  let results = miniSearch.search('zen art motorcycle')
  // => [
  //   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258, match: { ... } },
  //   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629, match: { ... } }
  // ]

  const isServiceField = (key) =>{
    switch (key) {
      case 'highlight':
        return true
      case '_index':
        return true
      case '_type':
        return true
      case '_doc':
        return true
      case '_id':
        return true
      case '_score':
        return true
      case '_click_id':
        return true
      default:
        return false
    }
  }

  const getLabelInfo = (key, value) =>{
    console.log(key, value);
    if (!isServiceField(key)){
      let skip = false;
      let isLink = false;
      switch (key) {
        case 'ANO':
          key = 'Año'
          break;
        case 'NOMBRE_COMPLETO':
            key = 'Nombre Completo'
            break;
        case 'SEGURO_PENSION_EMPLEADO':
            skip = true;
            key = 'SEGURO_PENSION_EMPLEADO'
            break;
        case 'SUBTOTAL_TSS':
            skip = true;
            key = 'Subtotal Tss'
            break;
        case 'SEGURO_PENSION_PATRONAL':
            skip = true;
            key = 'SEGURO_PENSION_PATRONAL'
            break;
        case 'SEGURO_SALUD_EMPLEADO_PATRONAL':
            skip = true;
            key = 'SEGURO_SALUD_EMPLEADO_PATRONAL'
            break;
        case 'REGISTRO_DEPENDIENTES_ADD':
            skip = true;
            key = 'REGISTRO_DEPENDIENTES_ADD'
            break;
        case 'FUENTE':
            isLink=true;
            key = 'Fuente'
            break;
        case 'TERMINO':
            if (value === '00/00/0000') skip=true
            key = 'Termino'
            break;
        case 'ISR':
            if (value === 0) skip=true
            key = 'ISR'
            break;
        case 'APORTES_PATRONAL':
            skip = true;
            key = 'APORTES_PATRONAL'
            break;
        case 'SUELDO_BRUTO':
            value = `RD$ ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo Bruto'
            break;
        case 'TIPO_DE_EMPLEADO':
            key = 'Tipo de Empleado'
            break;
        case 'CARGO':
            key = 'Cargo'
            break;
        case 'MINISTERIO':
            key = 'Ministerio'
            break;
        case 'SUELDO_NETO':
            value = `RD$ ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo Neto'
            break;
        case 'SUELDO_US':
            if (value === 0) skip=true
            value = `$US ${ numeral(value).format('0,0.00') }`;
            key = 'Sueldo'
            break;
        case 'SEGURO_SAV_ICA':
            skip = true;
            key = 'SEGURO_SAV_ICA'
            break;
        case 'RIESGOS_LABORALES':
            skip = true;
            key = 'RIESGOS_LABORALES'
            break;
        case 'INICIO':
            if (value === '00/00/0000') skip=true
            key = 'Inicio'
            break;
        case 'MES':
            key = 'Mes'
            break;
        case 'DEPARTAMENTO':
            key = 'Departamento'
            break;
        case 'TOT_RETENCIONES_DEDUCCION_EMPLEADO':
            skip = true;
            key = 'TOT_RETENCIONES_DEDUCCION_EMPLEADO'
            break;
        case 'SEGURO_SALUD_EMPLEADO':
            skip = true;
            key = 'SEGURO_SALUD_EMPLEADO'
            break;
        case 'GASTOS_DE_REPRESENTACION_US':
            if (value === 0) skip=true
            value = `$US ${ numeral(value).format('0,0.00') }`;
            key = 'Gastos de Representacion'
            break;
        case 'TIPO_DE_EMPLEADO_CARGO':
            key = 'Tipo de Cargo'
            break;
        case 'ESTATU_EMPLEADO':
            key = 'Estatus Empleado'
            break;
        case 'TASA_RD':
          if (value === 0) skip=true
          value = `$RD ${ numeral(value).format('0,0.00') }`;
          key = 'Tasa de Cambio'
          break;
        case 'SUELDO_EUR':
          if (value === 0) skip=true
          value = `$EUR ${ numeral(value).format('0,0.00') }`;
          key = 'Sueldo'
          break;
        default:
      }
      if (!skip){
        if (isLink) return <li key={key} style={{ display: 'flex',alignItems: 'flex-start', whiteSpace: 'break-spaces' }}><b>{ key }:</b> <p style={{ margin: 0,marginLeft: 10 }}><a href={value} target='_blank' >{ 'Portal' }</a></p></li>;
        return <li key={key} style={{ display: 'flex',alignItems: 'flex-start', whiteSpace: 'break-spaces' }}><b>{ key }:</b> <p style={{ margin: 0,marginLeft: 10 }}>{ value }</p></li>;
      }
    }
  }

  const Card = (result) =>{
    return(
      <div style={{ width: '100%' }}>
          <div className="courses-container col-xs-6">
              <div className="course">
                  <div className="course-preview">
                      <h6>{ result.MINISTERIO }</h6>
                      <h2>{ result.NOMBRE_COMPLETO }</h2>
                      {/**<a href="#">View all details <i className="fas fa-chevron-right"></i></a> */}
                  </div>
                  <div className="course-info">
                      <h6>{ result.DEPARTAMENTO }</h6>
                      <pre>
                        <ul>
                          {
                            Object.keys(result).map((k, v) => {
                              let val = result[k];
                              let label = JSON.stringify(result) //getLabelInfo(k,val);
                              console.log(result);
                              return label
                            })
                          }
                      </ul></pre>
                      <button className="btn">RD$ { numeral(result.SUELDO_BRUTO).format('0,0.00') }</button>
                  </div>
              </div>
          </div>
      </div>
    )
  }

  if (results.length > 0){
    return results.map(res => {
      return <Card result={res} />
    })
  }

  return (
      <p>Edu</p>
  );
}
