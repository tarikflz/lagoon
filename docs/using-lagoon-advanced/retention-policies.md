# Retention Policies

Retention policies are a way for Lagoon platform operators to be able to define how long certain items are retained for. General users aren't able to create or modify them.

Currently, Lagoon has support for 2 main policy types

* Harbor - Used to define how long images are retained in Harbor after they're no longer used.
* History - Used to define how much history for environment deployments and tasks are kept. This includes removing logs and any files associated to those deployments and tasks.

!!! Info
    More policy types may be added in the future, stay tuned.

## Policy Information

Policy types are used to influence different parts of retention within Lagoon, this means it is possible to add retention policies that target specific areas for retention.

Policies can be applied to the following scopes: `global`, `organization`, and `project`.

If applied to the `global` scope, ALL projects will receive the policy. If a policy is then added to an `organization` scope, then this policy will override anything at the `global` scope, and then the same for `project` scope would override the other two.

Policies are created as a top level resource, meaning they can exist but not be assigned or used. An administrator can then link a policy to a scope. The act of linking a policy to a scope is what will turn the policy on (if the state is enabled)

A policy of one type can only be applied to a scope at a single time. For example, if a `Harbor` policy is applied to the global scope, then you cannot add another `Harbor` policy to the global scope.

Different policy types will have different methods of enforcement. See enforcement for each policy type below.

## Harbor Policies

This policy type is for managing how many images pushed to Harbor are retained. This is a simplified version of what Harbor offers that will work for images that Lagoon pushes into projects.

The configuration options for Harbor retention policies are
* enabled - the state of the policy
* rules - a list of rules to apply (or based)
  * name - the name of the rule
  * pattern - the pattern to use, this is based on doublestar path pattern matching and globbing (Harbor uses this https://github.com/bmatcuk/doublestar#patterns)
  * latestPulled - the number of images to retain for this rule
* schedule - how often to run this retention policy in Harbor (this schedule is executed by Harbor, not lagoon)

!!! Note
    Changing a policy from `enabled: true` to `enabled: false` will remove the policy from anything it may be associated to. This can be used to set a global (or organization) policy and allow an organization (or project) policy to disable it.

### Enforcement

When a Harbor policy is linked, unlinked, or updated, a message is sent to any associated DeployTargets (Kubernetes) to pass on to the Harbor defined in that DeployTarget.

For example, if a Harbor policy is linked to a scope, a hook is executed which will work out, based on the scope, which DeployTargets need to be informed of the new policy.

If there exists a global scoped Harbor policy, and a new organization based policy is created and linked to an organization. The policy enforcer will work out which DeployTargets any projects within that organization need to be informed of this new policy and send messages to them so they update the policy in their respective Harbors.
If the organization based policy is removed from the organization, then the enforcer will send a message to all of the projects in that organization again to inform them to revert back to the global policy. The same actions are performed if the policy would be applied to a project scope.

### Creating a Harbor policy

```
mutation createHarborPolicy {
  createHarborRetentionPolicy(input:{
    name: "custom-harbor-policy"
    enabled: true
    rules: [
      {
        name: "all branches, excluding pullrequests"
        pattern: "[^pr\\-]*/*"
        latestPulled: 3
      },
      {
        name: "pullrequests"
        pattern: "pr-*"
        latestPulled: 1
      }
    ]
    schedule: "3 3 * * 3"
  }) {
    id
    name
    configuration {
      ... on HarborRetentionPolicy {
        enabled
        rules {
          name
          pattern
          latestPulled
        }
        schedule
      }
    }
    created
    updated
  }
}
```

### Linking a Harbor policy

For a policy to be used, it needs to be linked to something. An example is provided below showing linking the example policy above to the `global` scope.
```
mutation addPolicyLink{
  addHarborRetentionPolicyLink(input:{
    name: "custom-harbor-policy"
    scope: GLOBAL
    scopeName: "global",
  }) {
    id
    name
    source
    created
    updated
  }
}
```

## History Policies

This policy type will trim down the number of items that are retained in an environments history.

The configuration options for history are
* enabled - the state of the policy
* deploymentType - can be one of `COUNT`, `DAYS`, `MONTHS`
* deploymentHistory - depending on the type selected, will retain deployments (logs, status, etc...) to this number accordingly
* taskType - can be one of `COUNT`, `DAYS`, `MONTHS`
* taskHistory - depending on the type selected, will retain task history (logs, status, etc...) to this number accordingly

!!! Note
    There is a variable `ENABLE_SAVED_HISTORY_EXPORT` that is `false` by default. Setting this to `true` will export data for any deleted environments to the s3 files bucket before the environment is deleted. This exports the current `project`, `environment`, and the associated environments `task` and `deployment` history at the time of deletion. The path of this file will be `history/${projectname}-${projectid}/${environmentname}-${environmentid}/history-${unixtimestamp}.json`.

    If a `history` based retention policy is run against an environment before it is deleted, the exported history snapshot will not contain data that was purged by a retention policy.

### Enforcement

History policies are enforced on demand. For example, when a new task or deployment is triggered, a hook is called that will check if the environment needs to enforce the policy or not based on the policy configuration.

### Creating a history policy

```
mutation createHistoryPolicy {
  createHistoryRetentionPolicy(input:{
    name: "custom-history-policy"
    enabled: true
    deploymentHistory: 15
    deploymentType: DAYS
    taskHistory: 3
    taskType: MONTHS
  }) {
    id
    name
    configuration {
      ... on HistoryRetentionPolicy {
        enabled
        deploymentHistory
        deploymentType
        taskHistory
        taskType
      }
    }
    created
    updated
  }
}
```

### Linking a history policy

For a policy to be used, it needs to be linked to something. An example is provided below showing linking the example policy above to the `global` scope.

```
mutation addPolicyLink{
  addHistoryRetentionPolicyLink(input:{
    name: "custom-history-policy"
    scope: GLOBAL
    scopeName: "global",
  }) {
    id
    name
    source
    created
    updated
  }
}
```