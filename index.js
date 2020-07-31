import argparse from 'argparse'
import fs from 'fs'
import _ from 'lodash'

const getArguments = () => {
    var parser = new argparse.ArgumentParser({
        version: process.env.npm_package_version,
        addHelp: true,
        description: 'Generate something from the Stars Without Number book'
    })
    parser.addArgument(
        'type',
        {
            help: 'What to generate',
            choices: fs.readdirSync('generators').map(filename => filename.replace('.json', '')),
            required: true
        }
    )
    parser.addArgument(
        ['-c', '--count'],
        {
            help: 'Amount to generate',
            defaultValue: 1
        }
    )
    parser.addArgument(
        ['-f', '--file'],
        {
            help: 'File to save to'
        }
    )
    parser.addArgument(
        '--format',
        {
            help: 'Format to save in',
            defaultValue: 'json',
            choices: ['text', 'json']
        }
    )
    return parser.parseArgs()
}

const createIndent = level => {
    if (level === 0) {
        return ''
    } else {
        return `${'-'.repeat(level)} `
    }
}

const generate = generator => {
    if (Array.isArray(generator)) {
        return generate(generator[Math.floor(Math.random() * generator.length)])
    } else if (generator instanceof Object) {
        return Object.entries(generator)
            .map(([key, value]) => [key, generate(value)])
            .reduce((acc, [key, value]) => ({
                ...acc,
                [key]: value
            }), {})
    } else {
        return generator
    }
}

const stringifyGeneration = (generation, level = 0) => {
    if (generation instanceof Object) {
        return Object.entries(generation).map(([key, value]) => `${createIndent(level)}${key}\n${stringifyGeneration(value, level + 1)}`).join('\n')
    } else {
        return `${createIndent(level)}${generation}`
    }
}

const run = () => {
    const args = getArguments()

    const generator = JSON.parse(fs.readFileSync(`generators/${args.type}.json`))
    const result = _.times(args.count, () => generate(generator))
    if (args.file) {
        switch (args.format) {
            case 'json':
                fs.writeFileSync(args.file, JSON.stringify(result, null, 2))
                break
            case 'text':
                fs.writeFileSync(args.file, result.map(generation => stringifyGeneration(generation)).join('\n---\n'))
                break
        }
    } else {
        console.log(result.map(generation => stringifyGeneration(generation)).join('\n---\n'))
    }
}

run()