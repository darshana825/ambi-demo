import React from 'react';
import Session  from '../../middleware/Session';
import Autosuggest from 'react-autosuggest';
import Lib from '../../middleware/Lib';

export default class SkillsAndInterests extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loggedUser:Session.getSession('prg_lg'),
            editFormVisible : false,
            data : {}
        };

        this.editForm = this.editForm.bind(this);
        this.closeForm = this.closeForm.bind(this);
        this.loadSkills();

        this.tempdata = {
            day_to_day_comforts:[
                {id: "56e117d32762306307c36707", name: "CSS"},
                {is: "56e117d32762306307c36708", name: "Javascript"},
                {id: "56e117d32762306307c36706", name: "HTML"}
            ],
            experienced:[
                {id: "56e117d32762306307c36707", name: "CSS"},
                {is: "56e117d32762306307c36708", name: "Javascript"},
                {id: "56e117d32762306307c36706", name: "HTML"}
            ]
        }

    }

    loadSkills(){
        $.ajax({
            url: '/user/skills/'+this.props.uname,
            method: "GET",
            dataType: "JSON",
            data:{uname:this.props.uname},
            success: function (data, text) {
                if (data.status.code == 200) {
                    this.setState({data:data.user});
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }
        });
    };

    editForm(data){
        let formIsVisible = this.state.editFormVisible;
        this.setState({editFormVisible : !formIsVisible});
    }

    closeForm(){
        let formIsVisible = this.state.editFormVisible;
        this.setState({editFormVisible : !formIsVisible}); 
    }

    render() {
        let read_only = (this.state.loggedUser.id == this.state.data.user_id)?false:true;
        if(Object.keys(this.state.data).length == 0){
            return (<div> Loading </div>);
        }
        return (
            <div>
                <div className="inner-section skills pg-section">
                    <div className="inner-header">
                        <div className="header-wrapper">
                            <span className="header-icon classes"></span>
                            <span className="header-text">skills</span>
                            {
                                (!read_only)?
                                    <button className="btn add-data" onClick={this.editForm}>+ add skills</button>
                                : null
                            }
                        </div>
                    </div>
                    {this.state.editFormVisible?
                        <SkillsForm  data={this.state.data.skills}
                                        onFormSave={this.editForm}
                                        onFormClose={this.closeForm} /> : null}
                    <div className="inner-container">
                        <div className="title-wrapper">
                            <SkillTagList skills={this.state.data.skills.experienced} editable=""/>
                        </div>
                    </div>
                </div>
                <div className="inner-section interests pg-section">
                    <div className="inner-header">
                        <div className="header-wrapper">
                            <span className="header-icon classes"></span>
                            <span className="header-text">interests</span>
                            {
                                (!read_only)?
                                    <button className="btn add-data">+ add interests</button>
                                : null
                            }
                        </div>
                    </div>
                    {/*{this.state.editFormVisible?
                        <SkillsForm  data={this.state.data.skills}
                                        onFormSave={this.editForm}
                                        onFormClose={this.closeForm} /> : null}*/}
                    <div className="inner-container">
                        <div className="title-wrapper">
                            {/*<SkillTagList skills={} editable=""/>*/}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function getSuggestions(value, data) {
  const escapedValue = Lib.escapeRegexCharacters(value.trim());
  if (escapedValue === '') {
    return [];
  }
  const regex = new RegExp('^' + escapedValue, 'i');
  return data.filter(data => regex.test(data.name));
}

function getSuggestionValue(suggestion) {
  return suggestion.name;
}

function renderSuggestion(suggestion) {
  return (
    <span id={suggestion.id}>{suggestion.name}</span>
  );
}

export class SkillsForm extends React.Component{
    constructor(props){
        super(props);

        this.state={
            formData : this.props.data,
            updatedData : "",
            value: '',
            suggestions: getSuggestions(''),
            checked : false,
            suggestionsList : {},
            loggedUser:Session.getSession('prg_lg')
        };

        this.modifiedSkillsList = {
            day_to_day_comforts:{
                add : [],
                remove : []
            },
            experienced:{
                add : [],
                remove : []
            }
        }

        this.skills;
        $.ajax({
            url: '/skills',
            method: "GET",
            dataType: "JSON",
            success: function (data, text) {
                if(data.status.code == 200){
                    this.skills = data.skills;
                }
            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });

        this.skillId = [];
        this.removeSkill = this.removeSkill.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSkillAdd = this.onSkillAdd.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    }

    removeSkill(skill,id){
        let skillData = this.state.formData;
        let skillsObj = this.modifiedSkillsList;

        skillsObj["experienced"].remove.push(id);
        this.modifiedSkillsList = skillsObj;

        for (var key in skillData["experienced"]) {
            if (skillData["experienced"][key].id == id) delete skillData["experienced"][key];
        }

        this.setState({formData : skillData});
    }

    onFormSave(e){
        e.preventDefault();
        this.props.onFormSave(this.modifiedSkillsList);
        
        $.ajax({
            url: '/skill-info/save',
            method: "POST",
            dataType: "JSON",
            data: {skill_set:JSON.stringify(this.modifiedSkillsList)},
            headers: { 'prg-auth-header':this.state.loggedUser.token },
            success: function (data, text) {

            }.bind(this),
            error: function (request, status, error) {
                console.log(request.responseText);
                console.log(status);
                console.log(error);
            }.bind(this)
        });
    }

    onChange(event, { newValue }) {
        this.setState({ value: newValue });
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
          suggestions: getSuggestions(value, this.skills),
          suggestionsList : getSuggestions(value, this.skills)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            suggestions: []
        });
    }

    onSkillAdd(){
        let skillName = this.state.value;
        let skillsObj = this.modifiedSkillsList;
        let skillData = this.state.formData;
        let suggestionsList = this.state.suggestionsList;
        // let typeSelected = (this.state.checked)? 'day_to_day_comforts' : 'experienced';

        for (var key in suggestionsList) {
            if(suggestionsList[key].name == skillName){
                skillsObj["experienced"].add.push(suggestionsList[key].id);
                skillData["experienced"].push({id : suggestionsList[key].id, name : skillName})
            }
        }

        this.modifiedSkillsList = skillsObj;
        this.setState({formData : skillData, value : "", checked : false});
    }

    // onCheck(){
    //     let checked = this.state.checked;
    //     this.setState({checked : !checked});
    // }

    render() {
        const { value, suggestions, suggestionsList } = this.state;
        const inputProps = {
          placeholder: 'What are your areas of expertise?',
          value,
          onChange: this.onChange
        };

        return (
            <div className="form-area" id="skills-form">
                <div className="form-group inline-content">
                    <label className="pg-itel-lbl">Add Skills &amp; interests</label>
                    <Autosuggest suggestions={suggestions}
                        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
                        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps} />
                    {/*<div className="checkbox">
                        <label>
                            <input className="pg-experience-current-option" type="checkbox" name="day_to_day_comforts" checked={this.state.checked} onChange={this.onCheck.bind(this)} />Is this skill a day-to-day comfort?
                        </label>
                    </div>*/}
                    <button type="button" className="btn btn-primary pg-inline-item-btn" onClick={this.onSkillAdd}>Add</button>
                </div>
                <form onSubmit={this.onFormSave.bind(this)}>
                    {/*<div className="form-group">
                        <label>Day-to-day comforts</label>
                        <div className="pg-edit-skills-area">
                            <SkillTagList skills={this.state.formData.day_to_day_comforts}
                                          type="day_to_day_comforts"
                                          editable="true"
                                          removeSkill={this.removeSkill} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Experience with</label>
                        <div className="pg-edit-skills-area">
                            <SkillTagList
                                skills={this.state.formData.experienced}
                                type="experienced"
                                editable="true"
                                removeSkill={this.removeSkill} />
                        </div>
                    </div>*/}
                    <div className="form-group">
                        <label>Experience with</label>
                        <div className="pg-edit-skills-area">
                            <SkillTagList
                                skills={this.state.formData.experienced}
                                editable="true"
                                removeSkill={this.removeSkill} />
                        </div>
                    </div>
                    <button type="button" className="btn btn-default pg-btn-custom" onClick={this.props.onFormClose}>Cancel</button>
                    <button type="submit" className="btn btn-primary pg-btn-custom">Save</button>
                </form>
            </div>
        );
    }
}

const SkillTagList = ({skills,editable,removeSkill}) => {
    let _this = this;
    let _skills =(typeof  skills != 'undefined')?skills:[];
    
    if(editable){
        return (
            <ul className="skills-edit-section">
                {
                    _skills.map(function(skill,index){
                        return(
                            <li className="pg-endrose-item" key={index}>
                                <span className="pg-endorse-item-name" data-skillid={skill.id} >{skill.name}</span>
                                {(editable)? <i className="fa fa-times pg-skill-delete-icon" onClick={(event)=>removeSkill(skill.name, skill.id)}/> : null}
                            </li>
                        )
                    })
                }
            </ul>
        );
    }else{
        return (
            <div>
               { _skills.map(function(skill,index){
                    return(
                        <p className="skill-block" data-skillid={skill.id} key={index}>{skill.name}</p>
                    )
                })}
            </div>
        );
    }
}
