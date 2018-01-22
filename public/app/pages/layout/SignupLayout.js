import React from 'react'
import SignupHeader from '../../components/header/SignupHeader'
import SignupIndex from '../signup/Index'

const SignupLayout = (props) => {
  return(
    <div>
        <SignupHeader />
          {props.children}
    </div>
  );
}

export default SignupLayout;
