import { assert, expect, expectTypeOf, test } from 'vitest'

import List from '../src/list'
/* #region test setup */

interface IPackage {
  Company: string
  Weight: number
  TrackingNumber: number
}

interface IPerson {
  Name: string
  Age?: number
}

interface IPet {
  Name: string
  Age?: number
  Owner?: Person
  Vaccinated?: boolean
}

interface IProduct {
  Name: string
  Code: number
}

class Package {
  public Company: string
  public Weight: number
  public TrackingNumber: number

  constructor(p: IPackage) {
    this.Company = p.Company
    this.Weight = p.Weight
    this.TrackingNumber = p.TrackingNumber
  }
}

class Person implements IPerson {
  public Name: string
  public Age: number

  constructor(pet: IPet) {
    this.Name = pet.Name
    this.Age = pet.Age
  }
}

class Pet implements IPet {
  public Name: string
  public Age: number
  public Owner: Person
  public Vaccinated: boolean

  constructor(pet: IPet) {
    this.Name = pet.Name
    this.Age = pet.Age
    this.Owner = pet.Owner
    this.Vaccinated = pet.Vaccinated
  }
}

class Dog extends Pet {
  public Speak(): string {
    return 'Bark'
  }
}

class PetOwner {
  constructor(public Name: string, public Pets: List<Pet>) {}
}

class Product implements IProduct {
  public Name: string
  public Code: number

  constructor(product: IProduct) {
    this.Name = product.Name
    this.Code = product.Code
  }
}

/* #endregion */

test('Add', () => {
  const list = new List<string>()
  list.Add('hey')
  expect(list.First()).toBe('hey')
})

test('Append', () => {
  const list = new List<string>()
  list.AddRange(['hey', "what's", 'up'])
  list.Append('there')
  expect(list.Last()).toBe('there')
})

test('Prepend', () => {
  const list = new List<string>()
  list.AddRange(['hey', "what's", 'up'])
  list.Prepend('there')
  expect(list.First()).toBe('there')
})

test('AddRange', () => {
  const list = new List<string>()
  list.AddRange(['hey', "what's", 'up'])
  expect(list.ToArray()).toStrictEqual(['hey', "what's", 'up'])
})

test('Aggregate', () => {
  const sentence = 'the quick brown fox jumps over the lazy dog'
  const reversed = 'dog lazy the over jumps fox brown quick the '
  const words = new List<string>(sentence.split(' '))
  assert(
    words.Aggregate(
      (workingSentence, next) => next + ' ' + workingSentence,
      ''
    ),
    reversed
  )
})

test('All', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 10, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 6, Name: 'Whiskers' })
  ])

  // determine whether all pet names
  // in the array start with 'B'.
  expect(pets.All(pet => pet.Name.startsWith('B'))).toBeFalsy()
})

test('Any', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 8, Name: 'Barley', Vaccinated: true }),
    new Pet({ Age: 4, Name: 'Boots', Vaccinated: false }),
    new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  ])

  // determine whether any pets over age 1 are also unvaccinated.
  expect(pets.Any(p => p.Age > 1 && p.Vaccinated === false)).toBeTruthy()
  expect(pets.Any()).toBeTruthy()
})

test('Average', () => {
  const grades = new List<number>([78, 92, 100, 37, 81])
  const people = new List<IPerson>([
    { Age: 15, Name: 'Cathy' },
    { Age: 25, Name: 'Alice' },
    { Age: 50, Name: 'Bob' }
  ])
  expect(grades.Average()).toBe(77.6)
  expect(people.Average(x => x.Age)).toBe(30)
})

test('Cast', () => {
  const pets = new List<Pet>([
    new Dog({ Age: 8, Name: 'Barley', Vaccinated: true }),
    new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  ])

  const dogs = pets.Cast<Dog>()

  expectTypeOf(dogs.First().Speak).toBeFunction()
  expect(dogs.First().Speak()).toBe('Bark')
  expect(dogs.Last().Speak).toBeUndefined()
})

test('Clear', () => {
  const pets = new List<Pet>([
    new Dog({ Age: 8, Name: 'Barley', Vaccinated: true }),
    new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  ])

  expect(pets.Count()).toBe(2)
  pets.Clear()
  expect(pets.Count()).toBe(0)
})

test('Concat', () => {
  const cats = new List<Pet>([
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 1, Name: 'Whiskers' })
  ])
  const dogs = new List<Pet>([
    new Pet({ Age: 3, Name: 'Bounder' }),
    new Pet({ Age: 14, Name: 'Snoopy' }),
    new Pet({ Age: 9, Name: 'Fido' })
  ])
  const expected = ['Barley', 'Boots', 'Whiskers', 'Bounder', 'Snoopy', 'Fido']
  expect(
    cats
      .Select(cat => cat.Name)
      .Concat(dogs.Select(dog => dog.Name))
      .ToArray()
  ).toStrictEqual(expected)
})

test('Contains', () => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ])
  expect(fruits.Contains('mango')).toBeTruthy()
})

test('Count', () => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ])
  expect(fruits.Count()).toBe(6)
  expect(fruits.Count(x => x.length > 5)).toBe(3)
})

test('DefaultIfEmpty', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 1, Name: 'Whiskers' })
  ])
  expect(
    pets
      .DefaultIfEmpty()
      .Select(pet => pet.Name)
      .ToArray()
  ).toStrictEqual(['Barley', 'Boots', 'Whiskers'])
  const numbers = new List<number>()
  expect(numbers.DefaultIfEmpty(0).ToArray()).toStrictEqual([0])
})

test('Distinct', () => {
  const ages = new List<number>([21, 46, 46, 55, 17, 21, 55, 55])
  const pets = new List<Pet>([
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 9, Name: 'Corey' })
  ])
  const expected = new List<Pet>([
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 9, Name: 'Corey' })
  ])
  expect(ages.Distinct()).toStrictEqual(
    new List<number>([21, 46, 55, 17])
  )
  expect(pets.Distinct()).toStrictEqual(expected)
})

test('DistinctBy', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Daisy' })
  ])

  const result = new List<Pet>([
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 8, Name: 'Barley' })
  ])

  expect(pets.DistinctBy(pet => pet.Age)).toStrictEqual(result)
})

test('ElementAt', () => {
  const a = new List<string>(['hey', 'hola', 'que', 'tal'])
  expect(a.ElementAt(0)).toBe('hey')
  expect(() => a.ElementAt(4)).toThrowError(
    'ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.'
  )
  expect(() => a.ElementAt(-1)).toThrowError(
    'ArgumentOutOfRangeException: index is less than 0 or greater than or equal to the number of elements in source.'
  )
})

test('ElementAtOrDefault', () => {
  const a = new List<string>(['hey', 'hola', 'que', 'tal'])
  const b = new List<number>([2, 1, 0, -1, -2])
  expect(a.ElementAtOrDefault(0)).toBe('hey')
  expect(b.ElementAtOrDefault(2)).toBe(0)
  expect(a.ElementAtOrDefault(4)).toBe(undefined)
})

test('Except', () => {
  const numbers1 = new List<number>([2.0, 2.1, 2.2, 2.3, 2.4, 2.5])
  const numbers2 = new List<number>([2.2, 2.3])
  expect(numbers1.Except(numbers2).ToArray()).toStrictEqual([2, 2.1, 2.4, 2.5])
})

test('First', () => {
  expect(
    new List<string>(['hey', 'hola', 'que', 'tal']).First()
  ).toBe('hey')
  expect(
    new List<number>([1, 2, 3, 4, 5]).First(x => x > 2)
  ).toBe(3)
  expect(() => new List<string>().First()).toThrowError(
    'The source sequence is empty'
  )
})

test('FirstOrDefault', () => {
  expect(
    new List<string>(['hey', 'hola', 'que', 'tal']).FirstOrDefault()
  ).toBe('hey')
  expect(new List<string>().FirstOrDefault()).toBe(undefined)
})

test('ForEach', () => {
  const names = new List<string>(['Bruce', 'Alfred', 'Tim', 'Richard'])
  let test = ''
  names.ForEach((x, i) => (test += `${x} ${i} `))
  expect(test).toBe('Bruce 0 Alfred 1 Tim 2 Richard 3 ')
})

test('GroupBy', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 8, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 1, Name: 'Whiskers' }),
    new Pet({ Age: 4, Name: 'Daisy' })
  ])
  const result = {
    '1': ['Whiskers'],
    '4': ['Boots', 'Daisy'],
    '8': ['Barley']
  }
  expect(
    pets.GroupBy(
      pet => pet.Age,
      pet => pet.Name
    )
  ).toStrictEqual(result)
})

test('GroupJoin', () => {
  const magnus = new Person({ Name: 'Hedlund, Magnus' })
  const terry = new Person({ Name: 'Adams, Terry' })
  const charlotte = new Person({ Name: 'Weiss, Charlotte' })

  const barley = new Pet({ Name: 'Barley', Owner: terry })
  const boots = new Pet({ Name: 'Boots', Owner: terry })
  const whiskers = new Pet({ Name: 'Whiskers', Owner: charlotte })
  const daisy = new Pet({ Name: 'Daisy', Owner: magnus })

  const people = new List<Person>([magnus, terry, charlotte])
  const pets = new List<Pet>([barley, boots, whiskers, daisy])

  // create a list where each element is an anonymous
  // type that contains a person's name and
  // a collection of names of the pets they own.
  const query = people.GroupJoin(
    pets,
    person => person,
    pet => pet.Owner,
    (person, petCollection) => ({
      OwnerName: person.Name,
      Pets: petCollection.Select(pet => pet.Name)
    })
  )
  const expected = [
    'Hedlund, Magnus: Daisy',
    'Adams, Terry: Barley,Boots',
    'Weiss, Charlotte: Whiskers'
  ]
  expect(
    query.Select(obj => `${obj.OwnerName}: ${obj.Pets.ToArray()}`).ToArray()
  ).toStrictEqual(expected)
})

test('IndexOf', () => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ])

  const barley = new Pet({ Age: 8, Name: 'Barley', Vaccinated: true })
  const boots = new Pet({ Age: 4, Name: 'Boots', Vaccinated: false })
  const whiskers = new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  const pets = new List<Pet>([barley, boots, whiskers])

  expect(fruits.IndexOf('orange')).toBe(3)
  expect(fruits.IndexOf('strawberry')).toBe(-1)
  expect(pets.IndexOf(boots)).toBe(1)
})

test('Insert', () => {
  const pets = new List<Pet>([
    new Pet({ Age: 10, Name: 'Barley' }),
    new Pet({ Age: 4, Name: 'Boots' }),
    new Pet({ Age: 6, Name: 'Whiskers' })
  ])

  let newPet = new Pet({ Age: 12, Name: 'Max' })

  pets.Insert(0, newPet)
  pets.Insert(pets.Count(), newPet)

  expect(pets.First()).toBe(newPet)
  expect(pets.Last()).toBe(newPet)
  expect(() => pets.Insert(-1, newPet)).toThrowError('Index is out of range')
  expect(() => pets.Insert(pets.Count() + 1, newPet)).toThrowError(
    'Index is out of range'
  )
})

test('Intersect', () => {
  const id1 = new List<number>([44, 26, 92, 30, 71, 38])
  const id2 = new List<number>([39, 59, 83, 47, 26, 4, 30])
  expect(id1.Intersect(id2).Sum(x => x)).toBe(56)
})

test('Join', () => {
  const magnus = new Person({ Name: 'Hedlund, Magnus' })
  const terry = new Person({ Name: 'Adams, Terry' })
  const charlotte = new Person({ Name: 'Weiss, Charlotte' })

  const barley = new Pet({ Name: 'Barley', Owner: terry })
  const boots = new Pet({ Name: 'Boots', Owner: terry })
  const whiskers = new Pet({ Name: 'Whiskers', Owner: charlotte })
  const daisy = new Pet({ Name: 'Daisy', Owner: magnus })

  const people = new List<Person>([magnus, terry, charlotte])
  const pets = new List<Pet>([barley, boots, whiskers, daisy])

  // create a list of Person-Pet pairs where
  // each element is an anonymous type that contains a
  // pet's name and the name of the Person that owns the Pet.
  const query = people.Join(
    pets,
    person => person,
    pet => pet.Owner,
    (person, pet) => ({ OwnerName: person.Name, Pet: pet.Name })
  )
  const expected = [
    'Hedlund, Magnus - Daisy',
    'Adams, Terry - Barley',
    'Adams, Terry - Boots',
    'Weiss, Charlotte - Whiskers'
  ]
  expect(
    query.Select(obj => `${obj.OwnerName} - ${obj.Pet}`).ToArray()
  ).toStrictEqual(expected)
})

test('Last', () => {
  expect(
    new List<string>(['hey', 'hola', 'que', 'tal']).Last(),
    'tal'
  )
  expect(
    new List<number>([1, 2, 3, 4, 5]).Last(x => x > 2)
  ).toBe(5)
  expect(() => new List<string>().Last()).toThrowError(
    'The source sequence is empty'
  )
})

test('LastOrDefault', () => {
  expect(
    new List<string>(['hey', 'hola', 'que', 'tal']).LastOrDefault(),
    'tal'
  )
  expect(new List<string>().LastOrDefault(), undefined)
})

test('Max', () => {
  const people = new List<IPerson>([
    { Age: 15, Name: 'Cathy' },
    { Age: 25, Name: 'Alice' },
    { Age: 50, Name: 'Bob' }
  ])
  expect(people.Max(x => x.Age)).toBe(50)
  expect(
    new List<number>([1, 2, 3, 4, 5]).Max()
  ).toBe(5)
})

test('Min', () => {
  const people = new List<IPerson>([
    { Age: 15, Name: 'Cathy' },
    { Age: 25, Name: 'Alice' },
    { Age: 50, Name: 'Bob' }
  ])
  expect(people.Min(x => x.Age)).toBe(15)
  expect(
    new List<number>([1, 2, 3, 4, 5]).Min()
  ).toBe(1)
})

test('OfType', () => {
  const pets = new List<Pet>([
    new Dog({ Age: 8, Name: 'Barley', Vaccinated: true }),
    new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  ])
  const anyArray = new List<any>(['dogs', 'cats', 13, true])

  expect(anyArray.OfType(String).Count()).toBe(2)
  expect(anyArray.OfType(Number).Count()).toBe(1)
  expect(anyArray.OfType(Boolean).Count()).toBe(1)
  expect(anyArray.OfType(Function).Count()).toBe(0)

  expect(pets.OfType(Dog).Count()).toBe(1)
  expect(
    pets
      .OfType<Dog>(Dog)
      .First()
      .Speak()
  ).toBe('Bark')
})

test('OrderBy', () => {
  const expected = [1, 2, 3, 4, 5, 6]
  expect(
    new List<number>([4, 5, 6, 3, 2, 1])
      .OrderBy(x => x)
      .ToArray()
  ).toStrictEqual(expected)
  expect(
    new List<string>(['Deutschland', 'Griechenland', 'Ägypten'])
      .OrderBy(
        x => x,
        (a, b) => a.localeCompare(b)
      )
      .ToArray()
  ).toStrictEqual(['Ägypten', 'Deutschland', 'Griechenland'])
})

test('OrderByDescending', () => {
  expect(
    new List<number>([4, 5, 6, 3, 2, 1])
      .OrderByDescending(x => x)
      .ToArray()
  ).toStrictEqual([6, 5, 4, 3, 2, 1])
})

test('ThenBy', () => {
  const fruits = new List<string>([
    'grape',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'raspberry',
    'apple',
    'blueberry'
  ])
  // sort the strings first by their length and then
  // alphabetically by passing the identity selector function.
  const expected = [
    'apple',
    'grape',
    'mango',
    'banana',
    'orange',
    'blueberry',
    'raspberry',
    'passionfruit'
  ]
  expect(
    fruits
      .OrderBy(fruit => fruit.length)
      .ThenBy(fruit => fruit)
      .ToArray()
  ).toStrictEqual(expected)
  const expectedNums = [1, 2, 3, 4, 5, 6]
  // test omission of OrderBy
  expect(
    new List<number>([4, 5, 6, 3, 2, 1])
      .ThenBy(x => x)
      .ToArray()
  ).toStrictEqual(expectedNums)
})

// see https://github.com/kutyel/linq.ts/issues/23
test('ThenByMultiple', () => {
  let x = { a: 2, b: 1, c: 1 }
  let y = { a: 1, b: 2, c: 2 }
  let z = { a: 1, b: 1, c: 3 }
  let unsorted = new List([x, y, z])
  let sorted = unsorted
    .OrderBy(u => u.a)
    .ThenBy(u => u.b)
    .ThenBy(u => u.c)
    .ToArray()

  expect(sorted[0]).toBe(z)
  expect(sorted[1]).toBe(y)
  expect(sorted[2]).toBe(x)
})

test('ThenByDescending', () => {
  const fruits = new List<string>([
    'grape',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'raspberry',
    'apple',
    'blueberry'
  ])

  // sort the strings first by their length and then
  // alphabetically descending by passing the identity selector function.
  const expected = [
    'mango',
    'grape',
    'apple',
    'orange',
    'banana',
    'raspberry',
    'blueberry',
    'passionfruit'
  ]
  expect(
    fruits
      .OrderBy(fruit => fruit.length)
      .ThenByDescending(fruit => fruit)
      .ToArray()
  ).toStrictEqual(expected)
  expect(
    new List<number>([4, 5, 6, 3, 2, 1])
      .ThenByDescending(x => x)
      .ToArray()
  ).toStrictEqual([6, 5, 4, 3, 2, 1])
})

test('Remove', () => {
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ])

  const barley = new Pet({ Age: 8, Name: 'Barley', Vaccinated: true })
  const boots = new Pet({ Age: 4, Name: 'Boots', Vaccinated: false })
  const whiskers = new Pet({ Age: 1, Name: 'Whiskers', Vaccinated: false })
  const pets = new List<Pet>([barley, boots, whiskers])
  const lessPets = new List<Pet>([barley, whiskers])

  expect(fruits.Remove('orange')).toBeTruthy()
  expect(fruits.Remove('strawberry')).toBeFalsy()
  expect(pets.Remove(boots)).toBeTruthy()
  expect(pets).toStrictEqual(lessPets)
})

test('RemoveAll', () => {
  const dinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ])
  const lessDinosaurs = new List<string>([
    'Compsognathus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Gallimimus',
    'Triceratops'
  ])
  expect(dinosaurs.RemoveAll(x => x.endsWith('saurus'))).toStrictEqual(
    lessDinosaurs
  )
})

test('RemoveAt', () => {
  const dinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Velociraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ])
  const lessDinosaurs = new List<string>([
    'Compsognathus',
    'Amargasaurus',
    'Oviraptor',
    'Deinonychus',
    'Dilophosaurus',
    'Gallimimus',
    'Triceratops'
  ])
  dinosaurs.RemoveAt(3)
  expect(dinosaurs).toStrictEqual(lessDinosaurs)
})

test('Reverse', () => {
  expect(
    new List<number>([1, 2, 3, 4, 5])
      .Reverse()
      .ToArray()
  ).toStrictEqual([5, 4, 3, 2, 1])
})

test('Select', () => {
  expect(
    new List<number>([1, 2, 3])
      .Select(x => x * 2)
      .ToArray()
  ).toStrictEqual([2, 4, 6])
})

test('SelectMany', () => {
  const petOwners = new List<PetOwner>([
    new PetOwner(
      'Higa, Sidney',
      new List<Pet>([new Pet({ Name: 'Scruffy' }), new Pet({ Name: 'Sam' })])
    ),
    new PetOwner(
      'Ashkenazi, Ronen',
      new List<Pet>([new Pet({ Name: 'Walker' }), new Pet({ Name: 'Sugar' })])
    ),
    new PetOwner(
      'Price, Vernette',
      new List<Pet>([
        new Pet({ Name: 'Scratches' }),
        new Pet({ Name: 'Diesel' })
      ])
    )
  ])
  const expected = ['Scruffy', 'Sam', 'Walker', 'Sugar', 'Scratches', 'Diesel']
  expect(
    petOwners
      .SelectMany(petOwner => petOwner.Pets)
      .Select(pet => pet.Name)
      .ToArray()
  ).toStrictEqual(expected)
})

test('SequenceEqual', () => {
  const pet1 = new Pet({ Age: 2, Name: 'Turbo' })
  const pet2 = new Pet({ Age: 8, Name: 'Peanut' })

  // create three lists of pets.
  const pets1 = new List<Pet>([pet1, pet2])
  const pets2 = new List<Pet>([pet1, pet2])
  const pets3 = new List<Pet>([pet1])

  expect(pets1.SequenceEqual(pets2)).toBeTruthy()
  expect(pets1.SequenceEqual(pets3)).toBeFalsy()
})

test('Single', () => {
  const fruits1 = new List<string>()
  const fruits2 = new List<string>(['orange'])
  const fruits3 = new List<string>(['orange', 'apple'])
  const numbers1 = new List([1, 2, 3, 4, 5, 5])
  expect(fruits2.Single(), 'orange')
  expect(() => fruits1.Single()).toThrowError(
    'The collection does not contain exactly one element'
  )
  expect(() => fruits3.Single()).toThrowError(
    'The collection does not contain exactly one element'
  )
  expect(numbers1.Single(x => x === 1)).toStrictEqual(1)
  expect(() => numbers1.Single(x => x === 5)).toThrowError(
    'The collection does not contain exactly one element'
  )
  expect(() => numbers1.Single(x => x > 5)).toThrowError(
    'The collection does not contain exactly one element'
  )
})

test('SingleOrDefault', () => {
  const fruits1 = new List<string>()
  const fruits2 = new List<string>(['orange'])
  const fruits3 = new List<string>(['orange', 'apple'])
  const numbers1 = new List([1, 2, 3, 4, 5, 5])
  expect(fruits1.SingleOrDefault(), undefined)
  expect(fruits2.SingleOrDefault(), 'orange')
  expect(() => fruits3.SingleOrDefault()).toThrowError(
    'The collection does not contain exactly one element'
  )
  expect(numbers1.SingleOrDefault(x => x === 1)).toStrictEqual(1)
  expect(numbers1.SingleOrDefault(x => x > 5)).toStrictEqual(undefined)
  expect(() => numbers1.SingleOrDefault(x => x === 5)).toThrowError(
    'The collection does not contain exactly one element'
  )
})

test('Skip', () => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85])
  expect(
    grades
      .OrderByDescending(x => x)
      .Skip(3)
      .ToArray()
  ).toStrictEqual([82, 70, 59, 56])
})

test('SkipLast', () => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85])
  expect(
    grades
      .OrderByDescending(x => x)
      .SkipLast(3)
      .ToArray()
  ).toStrictEqual([98, 92, 85, 82])
})

test('SkipWhile', () => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85])
  expect(
    grades
      .OrderByDescending(x => x)
      .SkipWhile(grade => grade >= 80)
      .ToArray()
  ).toStrictEqual([70, 59, 56])
})

test('Sum', () => {
  const people = new List<IPerson>([
    { Age: 15, Name: 'Cathy' },
    { Age: 25, Name: 'Alice' },
    { Age: 50, Name: 'Bob' }
  ])
  expect(
    new List<number>([2, 3, 5]).Sum()
  ).toBe(10)
  expect(people.Sum(x => x.Age)).toBe(90)
})

test('Take', () => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85])
  expect(
    grades
      .OrderByDescending(x => x)
      .Take(3)
      .ToArray()
  ).toStrictEqual([98, 92, 85])
})

test('TakeLast', () => {
  const grades = new List<number>([59, 82, 70, 56, 92, 98, 85])
  expect(
    grades
      .OrderByDescending(x => x)
      .TakeLast(3)
      .ToArray()
  ).toStrictEqual([70, 59, 56])
})

test('TakeWhile', () => {
  const expected = ['apple', 'banana', 'mango']
  const fruits = new List<string>([
    'apple',
    'banana',
    'mango',
    'orange',
    'passionfruit',
    'grape'
  ])
  expect(fruits.TakeWhile(fruit => fruit !== 'orange').ToArray()).toStrictEqual(
    expected
  )
})

test('ToArray', () => {
  expect(
    new List<number>([1, 2, 3, 4, 5]).ToArray()
  ).toStrictEqual([1, 2, 3, 4, 5])
})

test('ToDictionary', () => {
  const people = new List<IPerson>([
    { Age: 15, Name: 'Cathy' },
    { Age: 25, Name: 'Alice' },
    { Age: 50, Name: 'Bob' }
  ])
  const dictionary = people.ToDictionary(x => x.Name)
  expect(dictionary['Bob']).toStrictEqual({ Age: 50, Name: 'Bob' })
  expect(dictionary['Bob'].Age).toBe(50)
  const dictionary2 = people.ToDictionary(
    x => x.Name,
    y => y.Age
  )
  expect(dictionary2['Alice']).toBe(25)
  // Dictionary should behave just like in C#
  expect(dictionary.Max(x => x.Value.Age)).toBe(50)
  expect(dictionary.Min(x => x.Value.Age)).toBe(15)
  const expectedKeys = new List(['Cathy', 'Alice', 'Bob'])
  expect(dictionary.Select(x => x.Key)).toStrictEqual(expectedKeys)
  expect(dictionary.Select(x => x.Value)).toStrictEqual(people)
})

test('ToList', () => {
  expect(
    new List<number>([1, 2, 3])
      .ToList()
      .ToArray()
  ).toStrictEqual([1, 2, 3])
})

test('ToLookup', () => {
  // create a list of Packages
  const packages = new List<Package>([
    new Package({
      Company: 'Coho Vineyard',
      TrackingNumber: 89453312,
      Weight: 25.2
    }),
    new Package({
      Company: 'Lucerne Publishing',
      TrackingNumber: 89112755,
      Weight: 18.7
    }),
    new Package({
      Company: 'Wingtip Toys',
      TrackingNumber: 299456122,
      Weight: 6.0
    }),
    new Package({
      Company: 'Contoso Pharmaceuticals',
      TrackingNumber: 670053128,
      Weight: 9.3
    }),
    new Package({
      Company: 'Wide World Importers',
      TrackingNumber: 4665518773,
      Weight: 33.8
    })
  ])

  // create a Lookup to organize the packages.
  // use the first character of Company as the key value.
  // select Company appended to TrackingNumber
  // as the element values of the Lookup.
  const lookup = packages.ToLookup(
    p => p.Company.substring(0, 1),
    p => p.Company + ' ' + p.TrackingNumber
  )
  const result = {
    C: ['Coho Vineyard 89453312', 'Contoso Pharmaceuticals 670053128'],
    L: ['Lucerne Publishing 89112755'],
    W: ['Wingtip Toys 299456122', 'Wide World Importers 4665518773']
  }
  expect(lookup).toStrictEqual(result)
})

test('Union', () => {
  const ints1 = new List<number>([5, 3, 9, 7, 5, 9, 3, 7])
  const ints2 = new List<number>([8, 3, 6, 4, 4, 9, 1, 0])
  expect(ints1.Union(ints2).ToArray()).toStrictEqual([
    5,
    3,
    9,
    7,
    8,
    6,
    4,
    1,
    0
  ])

  const result = [
    new Product({ Name: 'apple', Code: 9 }),
    new Product({ Name: 'orange', Code: 4 }),
    new Product({ Name: 'lemon', Code: 12 })
  ]
  const store1 = new List<Product>([
    new Product({ Name: 'apple', Code: 9 }),
    new Product({ Name: 'orange', Code: 4 })
  ])
  const store2 = new List<Product>([
    new Product({ Name: 'apple', Code: 9 }),
    new Product({ Name: 'lemon', Code: 12 })
  ])

  expect(store1.Union(store2).ToArray()).toStrictEqual(result)
})

test('Where', () => {
  const fruits = new List<string>([
    'apple',
    'passionfruit',
    'banana',
    'mango',
    'orange',
    'blueberry',
    'grape',
    'strawberry'
  ])
  const expected = ['apple', 'mango', 'grape']
  expect(fruits.Where(fruit => fruit.length < 6).ToArray()).toStrictEqual(
    expected
  )
})

test('Zip', () => {
  const numbers = new List<number>([1, 2, 3, 4])
  const words = new List<string>(['one', 'two', 'three'])
  expect(
    numbers.Zip(words, (first, second) => `${first} ${second}`).ToArray()
  ).toStrictEqual(['1 one', '2 two', '3 three'])
  // larger second array
  const expected = ['one 1', 'two 2', 'three 3']
  const numbers2 = new List<number>([1, 2, 3, 4])
  const words2 = new List<string>(['one', 'two', 'three'])
  expect(
    words2.Zip(numbers2, (first, second) => `${first} ${second}`).ToArray()
  ).toStrictEqual(expected)
})

test('Where().Select()', () => {
  expect(
    new List<number>([1, 2, 3, 4, 5])
      .Where(x => x > 3)
      .Select(y => y * 2)
      .ToArray()
  ).toStrictEqual([8, 10])
  expect(
    new List<number>([1, 2, 3, 4, 5])
      .Where(x => x > 3)
      .Select(y => y + 'a')
      .ToArray()
  ).toStrictEqual(['4a', '5a'])
})
