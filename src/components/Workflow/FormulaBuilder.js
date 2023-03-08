import { createStyles, Text, ActionIcon, Container} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {TbGripVertical} from 'react-icons/tb'
import {RiCloseLine} from 'react-icons/ri'
import {HiOutlineLightningBolt} from 'react-icons/hi'
import {AppendCard, PrependCard, ReplaceCard, ConcatenateCard, SubstringCard, TrimCard, UppercaseCard, LowercaseCard, CapitalizeCard} from './RecipeCards/StringRecipes'
import { AdditionCard, DivisionCard, MultiplicationCard, SubtractionCard } from './RecipeCards/NumericalRecipes';
import IfThenRecipeCard from './RecipeCards/ConditionalRecipes'
import useStore from '../../context/store'

const useStyles = createStyles((theme) => ({
  item: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    padding: `${theme.spacing.sm} ${theme.spacing.xl}`,
    paddingLeft: `calc(${theme.spacing.xl} - ${theme.spacing.md})`, // to offset drag handle
    backgroundColor: 'transparent'
    },

  itemDragging: {
    top: 0,
    left: 0,
  },

  symbol: {
    fontSize: 30,
    fontWeight: 700,
    width: 60,
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    color: theme.colorScheme === 'dark' ? theme.colors.dark[1] : theme.colors.gray[6],
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
  },
}));

const useDraggableInPortal = () => {
  const self = useRef({}).current;

  useEffect(() => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.pointerEvents = 'none';
      div.style.top = '0';
      div.style.width = '100%';
      div.style.height = '100%';
      self.elt = div;
      document.body.appendChild(div);
      return () => {
          document.body.removeChild(div);
      };
  }, [self]);

  return (render) => (provided, ...args) => {
      const element = render(provided, ...args);
      if (provided.draggableProps.style.position === 'fixed') {
          return createPortal(element, self.elt);
      }
      return element;
  };
};

export function FormulaBuilder({ data, updateFormula, removeFormula, reorderFormulas, renderSampleOutput}) {
  const { classes, cx } = useStyles();
  const [state, handlers] = useListState(data);
  const selectedMapping = useStore(state => state.selectedMapping)
  const [exampleInput, setExampleInput] = useState(selectedMapping?.sourceProperty?.key)
  const renderDraggable = useDraggableInPortal();

  useEffect(() => {
      if(data !== state){
        handlers.setState(data)
      }
  }, [data, handlers, state])

  const items = state.map((item, index) => (
    <Draggable key={item?.uuid} index={index} draggableId={item?.uuid}>
      { 
        renderDraggable (      
          (provided, snapshot) => {        
            return (
              <div
                className={cx(classes.item, { [classes.itemDragging]: snapshot.isDragging })}
                ref={provided.innerRef}
                {...provided.draggableProps}>
                <Container style={{display: 'flex', alignItems: 'center'}}>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <div style={{display:'flex', flexDirection:'row', justifyContent: 'space-between', alignItems:'center'}}>
                          <div {...provided.dragHandleProps} className={classes.dragHandle}>
                          <TbGripVertical />
                          </div>
                        <div style={{display:'flex', flexDirection:'column', border: '1px solid #E4E2DF', borderRadius: 12, width: '100%', padding: 18, paddingLeft: 20, paddingRight:20, background:'#F8F6F3', justifyContent: 'space-between', alignItems:'center'}}>
                        <div style={{display:'flex', flexDirection:'row',width: 800, justifyContent: 'space-between', alignItems:'start'}}> 
                              <div style={{display:'block'}}>
                                <div style={{display:'flex', flexDirection:'row', alignItems:'center'}}>
                                      <HiOutlineLightningBolt style={{width: 26, height: 28}}/>  
                                      <div style={{width: 10}}/>
                                      <Text style={{fontFamily:'Visuelt', fontWeight: 500, fontSize:'18px'}}>{item?.name}</Text>
                                </div>
                                <Text style={{marginLeft: 36, fontFamily:'Visuelt', fontWeight: 100, fontSize:'14px'}}>{item?.description}</Text>
                            </div>
                            <ActionIcon  
                                  onClick={()=>{
                                    removeFormula(item?.uuid) 
                                  }}>
                                  <RiCloseLine/>
                            </ActionIcon>
                          </div>
                          <div style={{height: 20}}/>
                          {
                              item?.formula == 'append' ? 
                                    <AppendCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'prepend' ? 
                                  <PrependCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'replace' ? 
                                  <ReplaceCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'substring' ?
                                  <SubstringCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'trim' ?
                                 <></>
                              : item?.formula == 'lowercase' ?
                                <></>
                              : item?.formula == 'uppercase' ?
                                <></>
                              : item?.formula == 'capitalize' ?
                                <></>
                              : item?.formula == 'ifthen' ?
                                 <IfThenRecipeCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty} targetProperty={selectedMapping?.targetProperty}/>
                              : item?.formula == 'addition' ? 
                                  <AdditionCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'subtraction' ? 
                                  <SubtractionCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'multiplication' ? 
                                  <MultiplicationCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : item?.formula == 'division' ? 
                                  <DivisionCard recipe={item} updateFormula={updateFormula} sourceProperty={selectedMapping?.sourceProperty}/>
                              : null  
                          }
                        </div>
                        </div>
                      <div style={{height: 20}}/>
                      <Container sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        backgroundColor: '#F8F6F3',
                        borderRadius: 12,
                      }}>
                        <Text sx={{
                          fontFamily: 'Visuelt',
                          fontWeight: 100,
                          fontSize: '16px',
                        }}>Sample Output</Text>
                        <Text sx={{
                          fontFamily: 'Visuelt',
                          fontWeight: 100,
                          fontSize: '16px',
                          marginLeft: 10,
                          color: '#B9B9B9'
                        }}>{renderSampleOutput(exampleInput)[index]}</Text>
                      </Container>
                      <div style={{height: 20}}/>
                    </div>
                </Container>
              </div>
        )})
      }
    </Draggable>
  ));

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) =>
        {
          reorderFormulas({ from: source.index, to: destination?.index || 0 })

        }
      }
    >
      <Droppable  droppableId="dnd-list" direction="vertical">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}