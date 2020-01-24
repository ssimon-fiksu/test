pipeline {
  agent any
  stages {
    stage('Slack start message') {
      steps {
        sh 'printenv'
        slackSend(channel: '#ui-do', message: start_message)
      }
    }

    stage('Build app staging') {
      when {
        branch 'staging'
      }
      steps {
        nodejs(cacheLocationStrategy: executor(), nodeJSInstallationName: 'node-10') {
          sh '''#!/bin/bash
          npm config set user 0
          npm config set unsafe-perm true
          npm install
          ng build --configuration=staging'''
        }
      }
    }
    stage('Build app production') {
      when {
        branch 'production'
      }
      steps {
        nodejs(cacheLocationStrategy: executor(), nodeJSInstallationName: 'node-10') {
          sh '''#!/bin/bash
          npm config set user 0
          npm config set unsafe-perm true
          npm install
          ng build --prod'''
        }
      }
    }
    stage('Publish app staging') {
      when {
        branch 'staging'
      }
      steps{
        sh '''#!/bin/bash
        cd dist/new-dash
        aws s3 cp --recursive . s3://dash.staging.fiksu.com/
        echo 'Released'
        '''
      }
    }

    stage('Clear cache'){
      steps {
        sh '''#/bin/bash
        # Invalidate old bucket
        aws cloudfront create-invalidation --distribution-id ${distibutionId} --paths /*
        '''
      }
    }

    stage('Publish app production') {
      when { 
        branch 'production'    
      }
      steps{
        sh '''#!/bin/bash
        cd dist/new-dash
        aws s3 cp --recursive . s3://dash.production.fiksu.com/
        cd ..
        tar cfz ${repo}.tgz ./new-dash
        echo 'Deployed'
        '''
      }
    }
    
    stage('Make release'){
    when {
        branch 'production'
      }
      steps {
        withCredentials([string(credentialsId: 'releaser-jenkins-token', variable: 'GITPASS')]) {
          sh (script: "./create_release.sh ${repo}")
          sh '''#/bin/bash
          # Invalidate old index.html
          aws cloudfront create-invalidation --distribution-id ${distibutionId} --paths "/*"
          '''
        }
      }
    }
  }
  
  environment {
    registry = 'docker.fiksu.com:5000'
    branchName = "${GIT_BRANCH.toLowerCase()}"
    distibutionId = "EE3Y0DK6CW4RX"
    build = "$BUILD_NUMBER"
    repo = "client_dashboard_ui"
    template = "<$RUN_DISPLAY_URL|$JOB_NAME-$build>${CHANGE_AUTHOR_DISPLAY_NAME ? ", author $CHANGE_AUTHOR_DISPLAY_NAME" : ""}\nChanges: $RUN_CHANGES_DISPLAY_URL${CHANGE_URL ? "\nView in Github: $CHANGE_URL" : ""}"
    start_message = "Build started $template"
    success_message = "Build completed $template"
  }
  post {
    failure {
      slackSend(color: "#FF0000", message: "Build failed, please check link: <$RUN_DISPLAY_URL|$branchName-$build>", baseUrl: 'https://fiksu-eng.slack.com/services/hooks/jenkins-ci/', token: 'NXG2NCYe6eegJQUgyefXLq68', channel: '#ui-do', botUser: false)  
    }
    aborted {
        slackSend(color: "#FFFF00", message: "Build aborted, please check link: <$RUN_DISPLAY_URL|$branchName-$build>", baseUrl: 'https://fiksu-eng.slack.com/services/hooks/jenkins-ci/', token: 'NXG2NCYe6eegJQUgyefXLq68', channel: '#ui-do', botUser: false)
    }
    success {
      slackSend(color: "#008000", message: success_message, baseUrl: 'https://fiksu-eng.slack.com/services/hooks/jenkins-ci/', token: 'NXG2NCYe6eegJQUgyefXLq68', channel: '#ui-do', botUser: false)
    }
  }
}
